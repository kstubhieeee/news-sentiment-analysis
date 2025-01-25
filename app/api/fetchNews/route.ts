import { NextResponse } from "next/server";

// Default companies for initial headlines
const defaultCompanies = ["Apple", "Tesla", "Microsoft", "Google", "Meta"];

async function fetchTopHeadlines() {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      throw new Error("NEWS_API_KEY is not configured");
    }

    const url = new URL("https://newsapi.org/v2/top-headlines");
    url.searchParams.append("category", "business");
    url.searchParams.append("language", "en");
    url.searchParams.append("pageSize", "10");

    const response = await fetch(url, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.articles.slice(0, 10).map((article: any, index: number) => ({
      id: index + 1,
      company: article.source.name || "Business News",
      headline: article.title,
      content: article.description || article.content || "No content available",
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return dummy data in case of error
    return [];
  }
}

export async function GET() {
  try {
    const newsData = await fetchTopHeadlines();
    return NextResponse.json(newsData);
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch news",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
