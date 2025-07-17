// File: app/api/analyze/route.ts
// v1.4: Swapped Gemini API for OpenAI API for AI analysis.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient'; // Import our Supabase client

// --- Rate Limiting (In-Memory for MVP) ---
const rateLimitStore: Record<string, { count: number; expiry: number }> = {};
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW = 60 * 1000;

// --- The AI Analysis Function (Now using OpenAI) ---
async function analyzeTextWithAI(text: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY; // IMPORTANT: Using the OpenAI key from environment variables
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }
  
  const apiUrl = `https://api.openai.com/v1/chat/completions`;

  const systemPrompt = `You are an expert product analyst. Your job is to analyze raw user feedback and categorize it. Analyze the following text and return a structured JSON object. Your response MUST be a valid JSON object. For each distinct piece of feedback, provide: a 'category' (e.g., 'Bug Report', 'Feature Request', 'UI/UX Complaint', 'Positive Feedback'), a 'sentiment' ('Positive', 'Negative', 'Neutral'), a one-sentence 'summary', and the original 'quote'. Finally, provide a top-level 'overall_summary' of the key themes found in the text.`;

  // The payload structure for OpenAI is different from Gemini's.
  const payload = {
    model: "gpt-3.5-turbo-1106", // A cost-effective model that supports JSON mode
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" } // Enforce JSON output
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}` // OpenAI uses a Bearer token for auth
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenAI API Error:", errorBody);
    throw new Error(`AI analysis failed with status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.choices && result.choices.length > 0 && result.choices[0].message) {
    // The response from OpenAI is a JSON string in the message content, so we parse it.
    const analysisJson = JSON.parse(result.choices[0].message.content);
    return analysisJson;
  } else {
    console.error("Unexpected OpenAI API response structure:", result);
    throw new Error("Failed to get a valid analysis from the AI.");
  }
}


export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const now = Date.now();

  if (rateLimitStore[ip] && rateLimitStore[ip].expiry < now) {
    delete rateLimitStore[ip];
  }
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 0, expiry: now + RATE_LIMIT_WINDOW };
  }
  rateLimitStore[ip].count++;
  if (rateLimitStore[ip].count > RATE_LIMIT_COUNT) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { text } = body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Input text is required.' }, { status: 400 });
  }

  try {
    const textHash = crypto.createHash('md5').update(text).digest('hex');
    
    const { data: existingReport, error: fetchError } = await supabase
      .from('reports')
      .select('id')
      .eq('source_text_hash', textHash)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Supabase fetch error:', fetchError);
      throw new Error('Could not query database.');
    }

    if (existingReport) {
      console.log(`Deduplication hit. Returning existing report ID: ${existingReport.id}`);
      return NextResponse.json({ jobId: existingReport.id });
    }

    const analysisResult = await analyzeTextWithAI(text);

    const { data: newReport, error: insertError } = await supabase
      .from('reports')
      .insert({
        report_data: analysisResult,
        source_text_hash: textHash,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error('Could not save analysis report.');
    }

    console.log(`Successfully saved new report with ID: ${newReport.id}`);
    return NextResponse.json({ jobId: newReport.id });

  } catch (error: any) {
    console.error('Error during analysis:', error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
