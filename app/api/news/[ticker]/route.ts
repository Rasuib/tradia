import { type NextRequest, NextResponse } from "next/server"

// News API key - in production, use environment variable
const NEWS_API_KEY = "2258fbb914d84a90a4047fb59c2c84d8"

export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const rawTicker = params.ticker
    const ticker = rawTicker.replace(/\.(NS|BO)$/i, "")

    console.log(`[v0] News API: Raw ticker: ${rawTicker}, Clean ticker: ${ticker}`)

    const query = `${ticker} stock`

    // Fetch news from NewsAPI
    const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`

    const response = await fetch(newsUrl)

    if (!response.ok) {
      throw new Error("Failed to fetch news data")
    }

    const data = await response.json()
    const headlines = data.articles.map((article: any) => article.title)

    // Simple sentiment analysis (in production, you'd use FinBERT or similar)
    const sentimentAnalysis = analyzeSentiment(headlines)

    return NextResponse.json({
      headlines,
      sentiment: sentimentAnalysis.sentiment,
      sentimentScore: sentimentAnalysis.score,
      totalArticles: data.totalResults,
    })
  } catch (error) {
    console.error("News API Error:", error)
    return NextResponse.json({ error: "Failed to fetch news data" }, { status: 500 })
  }
}

// Simple sentiment analysis function
function analyzeSentiment(headlines: string[]) {
  const positiveWords = ["growth", "profit", "gain", "rise", "up", "strong", "bullish", "upgrade", "beat", "surge"]
  const negativeWords = ["loss", "fall", "down", "weak", "bearish", "downgrade", "miss", "decline", "drop", "crash"]

  let score = 0
  let totalWords = 0

  headlines.forEach((headline) => {
    const words = headline.toLowerCase().split(" ")
    words.forEach((word) => {
      if (positiveWords.some((pw) => word.includes(pw))) {
        score += 1
        totalWords += 1
      } else if (negativeWords.some((nw) => word.includes(nw))) {
        score -= 1
        totalWords += 1
      }
    })
  })

  const normalizedScore = totalWords > 0 ? score / totalWords : 0
  let sentiment: "positive" | "negative" | "neutral"

  if (normalizedScore > 0.1) sentiment = "positive"
  else if (normalizedScore < -0.1) sentiment = "negative"
  else sentiment = "neutral"

  return {
    sentiment,
    score: Math.abs(normalizedScore),
  }
}
