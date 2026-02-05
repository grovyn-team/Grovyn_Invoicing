import { z } from 'zod';
import Client from '../models/Client.js';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
dotenv.config();

const FlexibleString = z.union([
  z.string(),
  z.array(z.string()).transform(val => val.join('\n'))
]);

const RequiredFlexibleString = z.union([
  z.string().min(1),
  z.array(z.string()).min(1).transform(val => val.join('\n'))
]);

const AIQuotationDraftSchema = z.object({
  projectName: z.string().min(1),
  projectScope: RequiredFlexibleString,
  features: RequiredFlexibleString,
  deliverables: RequiredFlexibleString,
  supportDetails: FlexibleString.optional(),
  warrantyPeriod: FlexibleString.optional(),
  timeline: RequiredFlexibleString,
  quotationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      quantity: z.number().min(0.01),
      unitPrice: z.number().min(0),
      taxRate: z.number().min(0).max(100),
      hsnSac: z.string().optional(),
    })
  ).min(1),
  taxDetails: z.object({
    taxProtocol: z.enum(['GST', 'EXPORT', 'NONE']).optional(),
    placeOfSupply: z.string().optional(),
  }).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentTerms: z.string().optional(),
  validityPeriod: z.number().min(1).max(365).optional(),
  confidence: z.number().min(0).max(1),
});

export type AIQuotationDraft = z.infer<typeof AIQuotationDraftSchema>;

interface GenerateQuotationDraftInput {
  prompt: string;
  clientId?: string;
  clientName?: string;
  userId: string;
}

function buildPrompt(
  prompt: string,
  client: any,
  company: any
): string {
  const clientGstStatus = client.gstin ? 'Yes' : 'No';
  const companyGstStatus = company.gstin ? 'Yes' : 'No';
  const defaultGstRate = 18;

  return `You are an IT software quotation generation assistant for an MSME invoice management system.

Given the following input, create a professional IT software quotation with all necessary details.
Return ONLY valid JSON matching the schema below. Do not include any markdown formatting, code blocks, or comments.

Company Context:
- Company: ${company.name}
- GST Enabled: ${companyGstStatus}
- Default GST Rate: ${defaultGstRate}%
- Currency: ${company.country === 'India' ? 'INR' : 'USD'}
- State: ${company.state}

Client Context:
- Client Name: ${client.name}${client.companyName ? ` (${client.companyName})` : ''}
- Client State: ${client.state}
- Client Country: ${client.country}
- GST Registered: ${clientGstStatus}
${client.gstin ? `- GSTIN: ${client.gstin}` : ''}
- Payment Terms: ${client.paymentTerms || 'Net 30'}

User Input:
"${prompt}"

Required JSON Schema:
{
  "projectName": "string (project/product name)",
  "projectScope": "string (detailed project scope and overview)",
  "features": "string (comprehensive list of features and functionalities, formatted as bullet points or paragraphs)",
  "deliverables": "string (detailed list of deliverables, formatted clearly)",
  "supportDetails": "string (optional - support and maintenance details)",
  "warrantyPeriod": "string (optional - e.g., '12 months', '6 months')",
  "timeline": "string (project timeline and milestones)",
  "quotationDate": "YYYY-MM-DD (today's date or extract from prompt)",
  "validUntil": "YYYY-MM-DD (default: 30 days from quotationDate)",
  "items": [
    {
      "name": "string (item/service name)",
      "description": "string (detailed description)",
      "quantity": number,
      "unitPrice": number,
      "taxRate": number (0-100, typically 18 for IT services),
      "hsnSac": "string (optional, e.g., 998311 for IT services)"
    }
  ],
  "taxDetails": {
    "taxProtocol": "GST | EXPORT | NONE",
    "placeOfSupply": "string (optional, state name)"
  },
  "discountPercentage": number (0-100, optional),
  "notes": "string (optional - additional notes)",
  "terms": "string (optional - terms and conditions)",
  "paymentTerms": "string (optional - payment schedule)",
  "validityPeriod": number (days, default 30, optional),
  "confidence": number (0-1, your confidence in the generation)
}

Important Rules:
1. Create professional IT software quotation with comprehensive details
2. Include all features mentioned in the prompt
3. Break down features and deliverables into clear, professional sections
4. For IT/software services, use HSN/SAC code 998311
5. Calculate validUntil as 30 days from quotationDate if not specified
6. Set confidence based on how clear the prompt is (0.7-0.95 for good prompts, 0.5-0.7 for ambiguous)
7. DO NOT include comments (// or /* */) in the JSON
8. Use actual date values, not placeholders
9. Ensure all pricing is reasonable for IT software services
10. Include warranty/support information if mentioned in prompt

Return ONLY valid JSON with no comments, no markdown formatting, and no explanatory text.`;
}

function extractJSON(text: string): string {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/mi, '');
  cleaned = cleaned.replace(/\s*```$/mi, '');
  cleaned = cleaned.trim();

  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error(`No valid JSON found in AI response. Response: ${text.substring(0, 200)}...`);
  }

  let jsonText = cleaned.substring(jsonStart, jsonEnd + 1);

  jsonText = jsonText.replace(/\/\/.*?$/gm, '');
  jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '');
  jsonText = jsonText.replace(/([{,]\s*)'([^']+)':/g, '$1"$2":');
  jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
  jsonText = jsonText.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  jsonText = jsonText.replace(/\n\s*\n/g, '\n');

  return jsonText;
}

export async function generateQuotationDraft(
  input: GenerateQuotationDraftInput
): Promise<{ draft: AIQuotationDraft; rawResponse: string }> {
  const { prompt, clientId, clientName, userId } = input;

  let client: any = null;
  if (clientId) {
    client = await Client.findById(clientId);
    if (client) {
      client = client.toObject();
    }
  }

  if (!client) {
    client = {
      name: clientName || 'Potential Client',
      companyName: clientName || 'Potential Client',
      state: 'Unknown',
      country: 'India',
      gstin: '',
      paymentTerms: 'Net 30'
    };
  }

  const company = await Company.findOne();
  if (!company) {
    throw new Error('Company not found');
  }

  const fullPrompt = buildPrompt(prompt, client, company.toObject());

  const HF_API_KEY = process.env.HF_API_KEY;
  let HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

  if (!HF_MODEL.includes(':')) {
    HF_MODEL = `${HF_MODEL}:featherless-ai`;
  }

  const HF_API_URL = `https://router.huggingface.co/v1/chat/completions`;

  if (!HF_API_KEY || HF_API_KEY.trim() === '') {
    throw new Error('HuggingFace API key not configured. Please set HF_API_KEY in your environment variables.');
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an IT software quotation generation assistant. Create professional quotations with comprehensive project details, features, and deliverables. Return ONLY valid JSON matching the provided schema. Do not include any markdown formatting or code blocks.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1200,
        top_p: 0.95
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HuggingFace API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: HF_API_URL,
        model: HF_MODEL,
      });

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.code === 'model_not_supported') {
          throw new Error(
            `Model '${HF_MODEL}' is not supported by any enabled provider. ` +
            `Please enable a provider in your HuggingFace account settings or update HF_MODEL in your .env file.`
          );
        }
      } catch (parseError) {
      }

      throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    let aiText: string;

    if (data && typeof data === 'object' && 'choices' in data && Array.isArray(data.choices) && data.choices.length > 0) {
      const firstChoice = data.choices[0];
      if (firstChoice.message && firstChoice.message.content) {
        aiText = firstChoice.message.content;
      } else if (firstChoice.text) {
        aiText = firstChoice.text;
      } else {
        aiText = JSON.stringify(firstChoice);
      }
    } else if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        aiText = (firstItem as any).generated_text || (firstItem as any).text || JSON.stringify(firstItem);
      } else {
        aiText = JSON.stringify(firstItem);
      }
    } else if (typeof data === 'object' && data !== null && 'generated_text' in data) {
      aiText = (data as any).generated_text;
    } else if (typeof data === 'string') {
      aiText = data;
    } else {
      aiText = JSON.stringify(data);
    }

    console.log('AI Response (first 500 chars):', aiText.substring(0, 500));

    let jsonText: string;
    try {
      jsonText = extractJSON(aiText);
    } catch (extractError: any) {
      console.error('Failed to extract JSON from AI response:', extractError.message);
      console.error('Full AI response:', aiText);
      throw new Error(`Failed to extract JSON from AI response: ${extractError.message}. Please try rephrasing your prompt.`);
    }

    console.log('Extracted JSON (first 300 chars):', jsonText.substring(0, 300));

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Failed JSON text:', jsonText);
      throw new Error(
        `Failed to parse AI response as JSON: ${parseError.message}. ` +
        `Please try rephrasing your prompt. ` +
        `Error at position ${parseError.message.match(/position (\d+)/)?.[1] || 'unknown'}.`
      );
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (parsed.quotationDate === 'YYYY-MM-DD' || !parsed.quotationDate || parsed.quotationDate.includes('YYYY')) {
      parsed.quotationDate = todayStr;
    }

    if (parsed.validUntil === 'YYYY-MM-DD' || !parsed.validUntil || parsed.validUntil.includes('YYYY')) {
      const quotationDate = new Date(parsed.quotationDate);
      const validUntil = new Date(quotationDate);
      validUntil.setDate(validUntil.getDate() + (parsed.validityPeriod || 30));
      parsed.validUntil = validUntil.toISOString().split('T')[0];
    }

    const validated = AIQuotationDraftSchema.parse(parsed);

    const quotationDate = new Date(validated.quotationDate);
    const validUntil = new Date(validated.validUntil);

    if (isNaN(quotationDate.getTime()) || isNaN(validUntil.getTime())) {
      throw new Error('Invalid date format in AI response');
    }

    if (validUntil < quotationDate) {
      validated.validUntil = new Date(quotationDate.getTime() + (validated.validityPeriod || 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    }

    return {
      draft: validated,
      rawResponse: aiText,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw new Error(`AI response validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}
