"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

interface StockComparison {
  symbol: string
  price: number
  change: number
  changePercent: number
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
}

export default function MultiStockComparison() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>(["RELIANCE.NS", "TCS.NS"])

  // Mock comparison data
  const stockData: StockComparison[] = [
    {
      symbol: "RELIANCE.NS",
      price: 2456.75,
      change: 23.45,
      changePercent: 0.96,
      sentiment: "positive",
      sentimentScore: 0.72,
    },
    {
      symbol: "TCS.NS",
      price: 3234.5,
      change: -12.3,
      changePercent: -0.38,
      sentiment: "neutral",
      sentimentScore: 0.05,
    },
    {
      symbol: "INFY.NS",
      price: 1567.8,
      change: 45.2,
      changePercent: 2.97,
      sentiment: "positive",
      sentimentScore: 0.84,
    },
    {
      symbol: "AAPL",
      price: 185.25,
      change: -2.15,
      changePercent: -1.15,
      sentiment: "negative",
      sentimentScore: -0.32,
    },
  ]

  const availableStocks = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "AAPL", "TSLA", "GOOG", "NIFTYBEES.NS"]

  const toggleStock = (symbol: string) => {
    setSelectedStocks(
      (prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol].slice(0, 4)), // Limit to 4 stocks
    )
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-400"
      case "negative":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    return sentiment === "positive" ? (
      <TrendingUp className="w-3 h-3" />
    ) : sentiment === "negative" ? (
      <TrendingDown className="w-3 h-3" />
    ) : null
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Multi-Stock Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stock Selection */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Select stocks to compare (max 4):</p>
          <div className="flex flex-wrap gap-2">
            {availableStocks.map((symbol) => (
              <Button
                key={symbol}
                variant={selectedStocks.includes(symbol) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStock(symbol)}
                className={
                  selectedStocks.includes(symbol)
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-3">
          {stockData
            .filter((stock) => selectedStocks.includes(stock.symbol))
            .map((stock) => (
              <div key={stock.symbol} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{stock.symbol}</h4>
                  <Badge className={getSentimentColor(stock.sentiment)}>
                    {getSentimentIcon(stock.sentiment)}
                    {stock.sentiment.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Price</p>
                    <p className="font-mono text-white">
                      {stock.symbol.includes(".NS") ? "₹" : "$"}
                      {stock.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Change</p>
                    <p className={`font-mono ${stock.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Sentiment Score</p>
                    <p className="font-mono text-white">{stock.sentimentScore.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {selectedStocks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Select stocks above to compare their performance and sentiment
          </div>
        )}
      </CardContent>
    </Card>
  )
}
