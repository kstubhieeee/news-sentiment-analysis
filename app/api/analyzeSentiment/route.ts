import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in the environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      throw new Error("No text provided for sentiment analysis");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content:
                "You are a sentiment analysis AI. Analyze the sentiment of the given text and tell me if i should buy, sell, or hold the stock.",
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Groq API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const sentiment = data.choices[0].message.content.trim();

    return NextResponse.json({ sentiment });
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment", details: error.message },
      { status: 500 }
    );
  }
}
