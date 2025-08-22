import { type NextRequest, NextResponse } from "next/server"

const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 300000 // 5 minutes cache
const requestQueue = new Map<string, Promise<any>>()

export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    console.log("[v0] Stock API called with params:", params)
    console.log("[v0] Request URL:", request.url)

    const ticker = params.ticker
    console.log("[v0] Processing ticker:", ticker)

    if (!ticker) {
      console.log("[v0] No ticker provided")
      return NextResponse.json({ error: "Ticker parameter is required" }, { status: 400 })
    }

    const cacheKey = ticker.toUpperCase()
    const now = Date.now()

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data)
    }

    if (requestQueue.has(cacheKey)) {
      const result = await requestQueue.get(cacheKey)
      return NextResponse.json(result)
    }

    // Create request promise and add to queue
    const requestPromise = fetchStockData(ticker, cacheKey, now)
    requestQueue.set(cacheKey, requestPromise)

    try {
      const result = await requestPromise
      return NextResponse.json(result)
    } finally {
      // Remove from queue when done
      requestQueue.delete(cacheKey)
    }
  } catch (error) {
    console.error("[v0] Stock API Error:", error)
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid data format received from provider" }, { status: 502 })
    }
    return NextResponse.json({ error: "Failed to fetch stock data. Please try again." }, { status: 500 })
  }
}

async function fetchStockData(ticker: string, cacheKey: string, now: number) {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`

  const response = await fetch(yahooUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!response.ok) {
    if (response.status === 429) {
      const cached = cache.get(cacheKey)
      if (cached) {
        return cached.data
      }
      throw new Error("Rate limit exceeded. Please try again later.")
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    console.error("Non-JSON response:", text.substring(0, 100))
    throw new Error("Invalid response format from data provider")
  }

  const data = await response.json()

  if (!data.chart || !data.chart.result || !data.chart.result[0]) {
    throw new Error("Stock not found or invalid ticker symbol")
  }

  const result = data.chart.result[0]
  const meta = result.meta

  if (!meta) {
    throw new Error("Invalid stock data received")
  }

  const currentPrice = meta.regularMarketPrice || meta.previousClose
  const previousClose = meta.previousClose
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  const stockData = {
    symbol: ticker.toUpperCase(),
    price: currentPrice,
    change: change,
    changePercent: changePercent,
    currency: meta.currency || "USD",
    marketState: meta.marketState || "UNKNOWN",
    exchangeName: meta.exchangeName || "Unknown Exchange",
  }

  cache.set(cacheKey, { data: stockData, timestamp: now })

  return stockData
}
