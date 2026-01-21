import { z } from 'zod';
import Client from '../models/Client.js';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
dotenv.config();

const AIProposalDraftSchema = z.object({
    projectName: z.string().min(1),
    version: z.string().default('v1.0'),
    problemStatement: z.string().min(1),
    solution: z.string().min(1),
    scope: z.string().min(1),
    deliverables: z.string().min(1),
    timelineEstimate: z.string().min(1),
    exclusions: z.string().optional(),
    nextSteps: z.string().optional(),
    proposalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    confidence: z.number().min(0).max(1),
});

export type AIProposalDraft = z.infer<typeof AIProposalDraftSchema>;

interface GenerateProposalDraftInput {
    prompt: string;
    clientId: string;
    userId: string;
}

function buildPrompt(
    prompt: string,
    client: any,
    company: any
): string {
    return `You are an IT software proposal generation assistant for an MSME business management system.

Given the following input, create a professional IT software proposal (WHY & WHAT) with all necessary details.
Return ONLY valid JSON matching the schema below. Do not include any markdown formatting, code blocks, or comments.

Company Context:
- Company: ${company.name}
- State: ${company.state}

Client Context:
- Client Name: ${client.name}${client.companyName ? ` (${client.companyName})` : ''}
- Client State: ${client.state}
- Client Country: ${client.country}

User Input:
"${prompt}"

Required JSON Schema:
{
  "projectName": "string (project/product name)",
  "version": "v1.0",
  "problemStatement": "string (Detailed description of the challenges the client is facing)",
  "solution": "string (How your proposed system/service will solve their problems)",
  "scope": "string (Define the boundaries of the project - what is included)",
  "deliverables": "string (List the key outputs/deliverables)",
  "timelineEstimate": "string (Estimated duration or key milestones)",
  "exclusions": "string (Clearly state what is NOT included to avoid scope creep)",
  "nextSteps": "string (Call to action or roadmap forward)",
  "proposalDate": "YYYY-MM-DD (today's date)",
  "validUntil": "YYYY-MM-DD (default: 30 days from proposalDate)",
  "confidence": number (0-1, your confidence in the generation)
}

Important Rules:
1. Create professional IT software proposal with comprehensive value proposition
2. Focus on WHY the solution is needed and WHAT will be done
3. Break down content into clear, professional sections
4. Set confidence based on how clear the prompt is (0.7-0.95 for good prompts, 0.5-0.7 for ambiguous)
5. DO NOT include comments (// or /* */) in the JSON
6. Use actual date values, not placeholders
7. Ensure the tone is persuasive and professional

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
        throw new Error(`No valid JSON found in AI response.`);
    }

    let jsonText = cleaned.substring(jsonStart, jsonEnd + 1);
    return jsonText;
}

export async function generateProposalDraft(
    input: GenerateProposalDraftInput
): Promise<{ draft: AIProposalDraft; rawResponse: string }> {
    const { prompt, clientId, userId } = input;

    const client = await Client.findById(clientId);
    if (!client) throw new Error('Client not found');

    const company = await Company.findOne();
    if (!company) throw new Error('Company not found');

    const fullPrompt = buildPrompt(prompt, client.toObject(), company.toObject());

    const HF_API_KEY = process.env.HF_API_KEY;
    let HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
    if (!HF_MODEL.includes(':')) HF_MODEL = `${HF_MODEL}:featherless-ai`;

    const HF_API_URL = `https://router.huggingface.co/v1/chat/completions`;

    if (!HF_API_KEY) throw new Error('HF_API_KEY not configured.');

    const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: HF_MODEL,
            messages: [
                { role: 'system', content: 'You are an IT software proposal assistant. Return ONLY valid JSON.' },
                { role: 'user', content: fullPrompt },
            ],
            temperature: 0.2,
            max_tokens: 2000,
        }),
    });

    if (!response.ok) throw new Error(`HF API error: ${response.status}`);

    const data = (await response.json()) as any;
    const aiText = data.choices[0].message.content;
    const jsonText = extractJSON(aiText);
    const parsed = JSON.parse(jsonText);

    // Date fixes
    const todayStr = new Date().toISOString().split('T')[0];
    if (!parsed.proposalDate || parsed.proposalDate.includes('YYYY')) parsed.proposalDate = todayStr;
    if (!parsed.validUntil || parsed.validUntil.includes('YYYY')) {
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);
        parsed.validUntil = validUntil.toISOString().split('T')[0];
    }

    const validated = AIProposalDraftSchema.parse(parsed);

    return { draft: validated, rawResponse: aiText };
}
