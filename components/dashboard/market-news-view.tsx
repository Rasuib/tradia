"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

const newsData = [
  {
    id: 1,
    title: "Market Rally Continues as Nifty Hits New High",
    summary: "Nifty 50 surged 2.3% to close at record levels amid positive global cues and strong quarterly earnings.",
    category: "Market Update",
    timestamp: "2 hours ago",
    sentiment: "bullish",
    impact: "high",
  },
  {
    id: 2,
    title: "Tech Stocks Lead Gains with Strong Q3 Results",
    summary: "IT sector outperformed with TCS and Infosys reporting better-than-expected quarterly numbers.",
    category: "Sector News",
    timestamp: "4 hours ago",
    sentiment: "bullish",
    impact: "medium",
  },
  {
    id: 3,
    title: "RBI Maintains Repo Rate at 6.5%",
    summary: "Reserve Bank of India keeps key interest rates unchanged, citing inflation concerns and growth outlook.",
    category: "Policy Update",
    timestamp: "6 hours ago",
    sentiment: "neutral",
    impact: "high",
  },
  {
    id: 4,
    title: "Banking Sector Shows Mixed Performance",
    summary: "Private banks outperform PSU banks as credit growth remains robust despite margin pressures.",
    category: "Sector News",
    timestamp: "8 hours ago",
    sentiment: "neutral",
    impact: "medium",
  },
  {
    id: 5,
    title: "Foreign Institutional Investors Turn Net Buyers",
    summary: "FIIs invested ₹2,450 crores in Indian equities after three consecutive days of selling.",
    category: "Market Flow",
    timestamp: "12 hours ago",
    sentiment: "bullish",
    impact: "medium",
  },
  {
    id: 6,
    title: "Oil Prices Impact Energy Stocks",
    summary: "Crude oil volatility affects Reliance and other energy sector stocks amid geopolitical tensions.",
    category: "Commodity",
    timestamp: "1 day ago",
    sentiment: "bearish",
    impact: "medium",
  },
]

export default function MarketNewsView() {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "bearish":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "border-green-500 bg-green-500/10"
      case "bearish":
        return "border-red-500 bg-red-500/10"
      default:
        return "border-yellow-500 bg-yellow-500/10"
    }
  }

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: "bg-red-500/20 text-red-400",
      medium: "bg-yellow-500/20 text-yellow-400",
      low: "bg-green-500/20 text-green-400",
    }
    return colors[impact as keyof typeof colors] || colors.medium
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Market News</h2>
          <p className="text-gray-400">Latest updates and market developments</p>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400">Live Updates</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {newsData.map((news) => (
          <Card
            key={news.id}
            className={`bg-gray-900/50 border-gray-800 ${getSentimentColor(news.sentiment)} border-l-4`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white leading-tight mb-2">{news.title}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    {getSentimentIcon(news.sentiment)}
                    <Badge variant="outline" className="text-xs">
                      {news.category}
                    </Badge>
                    <Badge className={getImpactBadge(news.impact)}>{news.impact.toUpperCase()}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-300 text-sm leading-relaxed mb-3">{news.summary}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {news.timestamp}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Market Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">68%</div>
              <div className="text-sm text-gray-400">Bullish Sentiment</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">1.2K</div>
              <div className="text-sm text-gray-400">News Articles</div>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">24/7</div>
              <div className="text-sm text-gray-400">Live Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
