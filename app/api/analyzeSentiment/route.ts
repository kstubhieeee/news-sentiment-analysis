import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided for analysis" },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create the prompt for stock recommendation
    const prompt = `Based on this news article, provide a one-word stock recommendation: either "BUY", "SELL", or "HOLD". Consider the market impact and sentiment. Here's the text: "${text}"`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const recommendation = response.text().trim().toUpperCase();

    // Validate the response
    if (!["BUY", "SELL", "HOLD"].includes(recommendation)) {
      return NextResponse.json({
        recommendation: "HOLD",
        note: "Defaulting to HOLD due to unclear analysis",
      });
    }

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.error("Error analyzing stock recommendation:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze stock recommendation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
