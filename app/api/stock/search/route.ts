import { type NextRequest, NextResponse } from "next/server"

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 300000 // 5 minutes cache

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const cacheKey = `search_${query.toUpperCase()}`
    const now = Date.now()

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    const results = []
    const baseQuery = query.toUpperCase().replace(/\.(NS|BO)$/, "") // Remove existing suffix if any

    // Try NSE (.NS) and BSE (.BO) for Indian stocks
    const exchanges = [
      { suffix: ".NS", name: "NSE", fullName: "National Stock Exchange" },
      { suffix: ".BO", name: "BSE", fullName: "Bombay Stock Exchange" },
    ]

    for (const exchange of exchanges) {
      try {
        const ticker = `${baseQuery}${exchange.suffix}`
        const stockData = await fetchStockData(ticker)

        if (stockData) {
          results.push({
            ...stockData,
            exchange: exchange.name,
            exchangeFullName: exchange.fullName,
            originalQuery: baseQuery,
          })
        }
      } catch (error) {
        // Continue to next exchange if this one fails
        console.log(`[v0] Failed to fetch ${baseQuery}${exchange.suffix}:`, error.message)
      }
    }

    // Also try the original query without suffix (for international stocks)
    if (!query.includes(".")) {
      try {
        const stockData = await fetchStockData(query)
        if (stockData) {
          results.push({
            ...stockData,
            exchange: "INTL",
            exchangeFullName: stockData.exchangeName || "International",
            originalQuery: query,
          })
        }
      } catch (error) {
        console.log(`[v0] Failed to fetch ${query}:`, error.message)
      }
    }

    const searchResults = {
      query: baseQuery,
      results: results,
      timestamp: now,
    }

    cache.set(cacheKey, { data: searchResults, timestamp: now })
    return NextResponse.json(searchResults)
  } catch (error) {
    console.error("[v0] Stock Search API Error:", error)
    return NextResponse.json({ error: "Failed to search stocks" }, { status: 500 })
  }
}

async function fetchStockData(ticker: string) {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`

  const response = await fetch(yahooUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.chart || !data.chart.result || !data.chart.result[0]) {
    throw new Error("Stock not found")
  }

  const result = data.chart.result[0]
  const meta = result.meta

  if (!meta) {
    throw new Error("Invalid stock data")
  }

  const currentPrice = meta.regularMarketPrice || meta.previousClose
  const previousClose = meta.previousClose
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    symbol: ticker.toUpperCase(),
    price: currentPrice,
    change: change,
    changePercent: changePercent,
    currency: meta.currency || "USD",
    marketState: meta.marketState || "UNKNOWN",
    exchangeName: meta.exchangeName || "Unknown Exchange",
  }
}
