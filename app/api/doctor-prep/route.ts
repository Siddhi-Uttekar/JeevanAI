// app/api/doctor-prep/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const debug: any = { step: 'init', time: new Date().toISOString() };

  try {
    debug.step = 'validate_env';
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY");
    }

    debug.step = 'parse_request';
    let jsonData;
    try {
      jsonData = await request.json();
      debug.requestData = jsonData;
    } catch (e) {
      throw new Error(`Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    }

    debug.step = 'validate_input';
    if (!jsonData?.symptoms) {
      throw new Error("Symptoms field is required");
    }

    debug.step = 'groq_call';
    const { Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `Create a doctor visit summary for these symptoms: ${jsonData.symptoms}`;
    debug.prompt = prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '');

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "mixtral-8x7b-32768",
    });
    debug.responseStatus = 'received';

    return NextResponse.json({
      success: true,
      summary: response.choices[0]?.message?.content,
      debug // Include debug info in development
    });

  } catch (error: any) {
    debug.error = error.message;
    debug.stack = error.stack;
    console.error("API Error Debug:", JSON.stringify(debug, null, 2));

    return NextResponse.json(
      {
        error: "Failed to generate summary",
        debug: process.env.NODE_ENV === 'development' ? debug : undefined
      },
      { status: 500 }
    );
  }
}