"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import RealTimeStockChart from "./real-time-stock-chart"

interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  currency: string
  marketState: string
  exchangeName: string
}

interface NewsData {
  headlines: string[]
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
  totalArticles: number
}

interface SearchResult {
  symbol: string
  price: number
  change: number
  changePercent: number
  currency: string
  marketState: string
  exchangeName: string
  exchange: string
  exchangeFullName: string
  originalQuery: string
}

interface SearchResponse {
  query: string
  results: SearchResult[]
  timestamp: number
}

interface StockSearchPanelProps {
  onStockSelect?: (stock: { symbol: string; price: number; name: string }) => void
  addToWatchlist?: (stock: {
    symbol: string
    name: string
    price: string
    change: string
    isPositive: boolean
    sector?: string
  }) => boolean
}

export default function StockSearchPanel({ onStockSelect, addToWatchlist }: StockSearchPanelProps) {
  const [ticker, setTicker] = useState("")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [newsData, setNewsData] = useState<NewsData | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMultiSearch = async () => {
    if (!ticker.trim()) return

    setLoading(true)
    setError(null)
    setShowSearchResults(true)
    setStockData(null)

    try {
      const response = await fetch(`/api/stock/search?q=${encodeURIComponent(ticker)}`)

      if (!response.ok) {
        throw new Error("Failed to search stocks")
      }

      const searchData: SearchResponse = await response.json()

      if (searchData.error) {
        throw new Error(searchData.error)
      }

      setSearchResults(searchData.results || [])

      if (searchData.results.length === 0) {
        setError("No stocks found for this search term")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const selectStock = async (result: SearchResult) => {
    setLoading(true)
    setShowSearchResults(false)

    try {
      const [stockResponse, newsResponse] = await Promise.all([
        fetch(`/api/stock/${result.symbol}`),
        fetch(`/api/news/${result.symbol}`),
      ])

      if (!stockResponse.ok) {
        throw new Error("Failed to fetch detailed stock data")
      }

      const stockResult = await stockResponse.json()
      const newsResult = await newsResponse.json()

      setStockData(stockResult)
      setNewsData(newsResult.error ? null : newsResult)

      if (onStockSelect && stockResult) {
        onStockSelect({
          symbol: stockResult.symbol,
          price: stockResult.price,
          name: stockResult.symbol,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePriceUpdate = (price: number, change: number, changePercent: number) => {
    if (stockData) {
      const updatedStockData = {
        ...stockData,
        price,
        change,
        changePercent,
      }
      setStockData(updatedStockData)

      // Update trading simulator with new price
      if (onStockSelect) {
        onStockSelect({
          symbol: stockData.symbol,
          price,
          name: stockData.symbol,
        })
      }
    }
  }

  const handleAddToWatchlist = (result: SearchResult) => {
    if (!addToWatchlist) return

    const watchlistStock = {
      symbol: result.symbol,
      name: result.symbol, // Could be enhanced with company name
      price: `${result.currency === "INR" ? "₹" : "$"}${result.price.toFixed(2)}`,
      change: `${result.changePercent >= 0 ? "+" : ""}${result.changePercent.toFixed(2)}%`,
      isPositive: result.changePercent >= 0,
      sector: "Unknown", // Could be enhanced with sector data
    }

    const success = addToWatchlist(watchlistStock)
    if (success) {
      // Could show a success message
      console.log(`Added ${result.symbol} to watchlist`)
    } else {
      // Could show an error message
      console.log(`${result.symbol} is already in watchlist`)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "negative":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    return sentiment === "positive" ? (
      <TrendingUp className="w-4 h-4" />
    ) : sentiment === "negative" ? (
      <TrendingDown className="w-4 h-4" />
    ) : null
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Stock Analysis Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter stock name (e.g., ADANIGREEN, RELIANCE, TCS)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleMultiSearch()}
            />
            <Button onClick={handleMultiSearch} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {showSearchResults && searchResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">Search Results:</h4>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors flex-col"
                >
                  <div>
                    <h5 className="text-lg font-bold text-white">{result.symbol}</h5>
                    <p className="text-xl font-mono text-green-400">
                      {result.currency === "INR" ? "₹" : "$"}
                      {result.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {result.exchangeFullName} ({result.exchange}) • {result.marketState}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${result.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {result.change >= 0 ? "+" : ""}
                      {result.change.toFixed(2)}
                    </p>
                    <p className={`text-sm ${result.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                      ({result.changePercent >= 0 ? "+" : ""}
                      {result.changePercent.toFixed(2)}%)
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => selectStock(result)}>
                        Select & Analyze
                      </Button>
                      {addToWatchlist && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white bg-transparent"
                          onClick={() => handleAddToWatchlist(result)}
                        >
                          Add to Watchlist
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stockData && !showSearchResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <h3 className="text-xl font-bold text-white">{stockData.symbol}</h3>
                  <p className="text-2xl font-mono text-green-400">
                    {stockData.currency === "INR" ? "₹" : "$"}
                    {stockData.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {stockData.exchangeName} • {stockData.marketState}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-semibold ${stockData.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {stockData.change >= 0 ? "+" : ""}
                    {stockData.change.toFixed(2)}
                  </p>
                  <p className={`text-sm ${stockData.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ({stockData.changePercent >= 0 ? "+" : ""}
                    {stockData.changePercent.toFixed(2)}%)
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                      onStockSelect?.({
                        symbol: stockData.symbol,
                        price: stockData.price,
                        name: stockData.symbol,
                      })
                    }
                  >
                    Trade This Stock
                  </Button>
                </div>
              </div>

              {newsData && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">Market Sentiment</h4>
                    <Badge className={getSentimentColor(newsData.sentiment)}>
                      {getSentimentIcon(newsData.sentiment)}
                      {newsData.sentiment.toUpperCase()} ({newsData.sentimentScore.toFixed(2)})
                    </Badge>
                  </div>

                  {/* News Headlines */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">
                      Recent News Analysis ({newsData.totalArticles} articles):
                    </p>
                    {newsData.headlines.map((headline, index) => (
                      <div key={index} className="text-sm text-gray-300 p-2 bg-gray-700/30 rounded">
                        • {headline}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Stock Suggestions */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Popular Stocks:</p>
            <div className="flex flex-wrap gap-2">
              {["RELIANCE", "TCS", "INFY", "ADANIGREEN", "AAPL", "TSLA", "GOOGL"].map((symbol) => (
                <Button
                  key={symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTicker(symbol)
                    // Auto-search when clicking suggestions
                    setTimeout(() => handleMultiSearch(), 100)
                  }}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {stockData && (
        <RealTimeStockChart
          symbol={stockData.symbol}
          currentPrice={stockData.price}
          change={stockData.change}
          changePercent={stockData.changePercent}
          currency={stockData.currency}
          onPriceUpdate={handlePriceUpdate}
        />
      )}
    </div>
  )
}
