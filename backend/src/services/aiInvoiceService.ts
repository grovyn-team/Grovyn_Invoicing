import { z } from 'zod';
import Client from '../models/Client.js';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
dotenv.config();

const AIInvoiceDraftSchema = z.object({
  invoiceType: z.enum([
    'Standard Invoice',
    'Proforma Invoice',
    'Tax Invoice',
    'Credit Note',
    'Debit Note',
    'Recurring Invoice',
    'Advance Invoice',
    'Final Settlement Invoice',
  ]),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  projectName: z.string().min(1),
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
  timeline: z.string().optional(),
  deliverables: z.string().optional(),
  paymentTerms: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type AIInvoiceDraft = z.infer<typeof AIInvoiceDraftSchema>;

interface GenerateInvoiceDraftInput {
  prompt: string;
  clientId: string;
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

  return `You are an invoice data extraction assistant for an MSME invoice management system.

Given the following input, extract structured invoice details.
Return ONLY valid JSON matching the schema below. Do not include any markdown formatting or code blocks.

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
  "invoiceType": "Tax Invoice | Proforma Invoice | Standard Invoice | Credit Note | Debit Note | Recurring Invoice | Advance Invoice | Final Settlement Invoice",
  "serviceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "projectName": "string",
  "items": [
    {
      "name": "string (short item name)",
      "description": "string (detailed description)",
      "quantity": number,
      "unitPrice": number,
      "taxRate": number (0-100),
      "hsnSac": "string (optional, e.g., 998311 for IT services)"
    }
  ],
  "taxDetails": {
    "taxProtocol": "GST | EXPORT | NONE",
    "placeOfSupply": "string (optional, state name)"
  },
  "discountPercentage": number (0-100, optional),
  "notes": "string (optional)",
  "timeline": "string (optional)",
  "deliverables": "string (optional)",
  "paymentTerms": "string (optional)",
  "confidence": number (0-1, your confidence in the extraction)
}

Important Rules:
1. If client country is not India, use taxProtocol: "NONE" or "EXPORT"
2. If client has GSTIN and company has GSTIN, use taxProtocol: "GST"
3. Calculate dueDate based on payment terms (default: 14 days from serviceDate)
4. For IT/software services, use HSN/SAC code 998311
5. Extract dates from the prompt or use today's date if not specified (format: YYYY-MM-DD, e.g., "2026-01-21")
6. Set confidence based on how clear the prompt is (0.7-0.95 for good prompts, 0.5-0.7 for ambiguous)
7. DO NOT include comments (// or /* */) in the JSON - JSON does not support comments
8. Use actual date values, not placeholders like "YYYY-MM-DD"
9. If amount is not specified, use 0 for unitPrice

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

export async function generateInvoiceDraft(
  input: GenerateInvoiceDraftInput
): Promise<{ draft: AIInvoiceDraft; rawResponse: string }> {
  const { prompt, clientId, userId } = input;

  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  const company = await Company.findOne();
  if (!company) {
    throw new Error('Company not found');
  }

  const fullPrompt = buildPrompt(prompt, client.toObject(), company.toObject());

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
            content: 'You are an invoice data extraction assistant. Extract structured invoice details from the user input and return ONLY valid JSON matching the provided schema. Do not include any markdown formatting or code blocks.',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
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
        // Continue with original error
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
    
    if (parsed.serviceDate === 'YYYY-MM-DD' || !parsed.serviceDate || parsed.serviceDate.includes('YYYY')) {
      parsed.serviceDate = todayStr;
    }
    
    if (parsed.dueDate === 'YYYY-MM-DD' || !parsed.dueDate || parsed.dueDate.includes('YYYY')) {
      const serviceDate = new Date(parsed.serviceDate);
      const dueDate = new Date(serviceDate);
      dueDate.setDate(dueDate.getDate() + 14);
      parsed.dueDate = dueDate.toISOString().split('T')[0];
    }

    const validated = AIInvoiceDraftSchema.parse(parsed);

    const serviceDate = new Date(validated.serviceDate);
    const dueDate = new Date(validated.dueDate);
    
    if (isNaN(serviceDate.getTime()) || isNaN(dueDate.getTime())) {
      throw new Error('Invalid date format in AI response');
    }

    if (dueDate < serviceDate) {
      validated.dueDate = new Date(serviceDate.getTime() + 14 * 24 * 60 * 60 * 1000)
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
