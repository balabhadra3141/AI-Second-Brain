import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not set' }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content: "You are a precise OCR transcription engine. Output ONLY the exact text and mathematical equations found in the image. Do NOT use markdown code blocks (like ```latex or ```markdown). Do NOT add conversational filler like 'Here is the text'. Write equations clearly. If the image is handwritten math, transcribe it exactly as it appears."
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices || !data.choices[0]) {
      throw new Error(data.error?.message || 'Failed to analyze image with vision model');
    }

    const transcribed = data.choices[0].message.content;

    return NextResponse.json({ text: transcribed });
  } catch (error: any) {
    console.error("[OCR API]", error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
