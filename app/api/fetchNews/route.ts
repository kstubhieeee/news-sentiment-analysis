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

    return data.articles.slice(0, 5).map((article: any, index: number) => ({
      id: index + 1,
      company: article.source.name || "Business News",
      headline: article.title,
      content: article.description || article.content || "No content available",
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return dummy data in case of error
    return [
      {
        id: 1,
        company: "Apple",
        headline: "Apple's AI Strategy Revealed",
        content:
          "Apple unveils its comprehensive artificial intelligence strategy, including new AI features for iOS and macOS.",
      },
      {
        id: 2,
        company: "Tesla",
        headline: "Tesla's New Battery Technology",
        content:
          "Tesla announces breakthrough in battery technology, promising 500 miles range and faster charging.",
      },
      {
        id: 3,
        company: "Microsoft",
        headline: "Microsoft's Cloud Revenue Soars",
        content:
          "Microsoft reports record-breaking cloud services revenue, exceeding market expectations.",
      },
      {
        id: 4,
        company: "Google",
        headline: "Google's Quantum Computing Milestone",
        content:
          "Google achieves quantum supremacy with its latest quantum computing breakthrough.",
      },
      {
        id: 5,
        company: "Meta",
        headline: "Meta's Revolutionary AR Glasses",
        content:
          "Meta launches next-generation AR glasses with advanced neural interface capabilities.",
      },
    ];
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
