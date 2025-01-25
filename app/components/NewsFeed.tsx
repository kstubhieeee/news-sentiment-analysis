"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NewsItem {
  id: number;
  company: string;
  headline: string;
  content: string;
  recommendation?: string;
}

async function fetchNews() {
  const response = await fetch("/api/fetchNews");
  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }
  return response.json();
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsAndAnalyze() {
      try {
        const newsData = await fetchNews();

        const analyzedNews = await Promise.all(
          newsData.map(async (item) => {
            try {
              const sentimentResponse = await fetch("/api/analyzeSentiment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: item.content }),
              });
              if (!sentimentResponse.ok) {
                const errorData = await sentimentResponse.json();
                throw new Error(
                  errorData.error ||
                    `HTTP error! status: ${sentimentResponse.status}`
                );
              }
              const data = await sentimentResponse.json();
              if (data.error) {
                throw new Error(data.error);
              }
              return { ...item, recommendation: data.recommendation };
            } catch (error) {
              console.error("Error analyzing recommendation:", error);
              return {
                ...item,
                recommendation:
                  "Error: " +
                  (error instanceof Error ? error.message : String(error)),
              };
            }
          })
        );

        setNews(analyzedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    }

    fetchNewsAndAnalyze();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {news.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle>{item.company}</CardTitle>
            <CardDescription>{item.headline}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{item.content}</p>
            <p className="font-bold">
              Recommendation:
              <span
                className={
                  item.recommendation?.startsWith("Error")
                    ? "text-red-500"
                    : item.recommendation === "BUY"
                    ? "text-green-500"
                    : item.recommendation === "SELL"
                    ? "text-red-500"
                    : "text-yellow-500"
                }
              >
                {" "}
                {item.recommendation}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
