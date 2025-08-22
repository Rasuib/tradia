import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MarketSentiment {
  stock: string
  sentiment: string
  confidence: number
  newsCount: number
  lastUpdated: string
  trend: "up" | "down" | "neutral"
}

interface MarketSentimentProps {
  sentiments: MarketSentiment[]
}

export default function MarketSentiment({ sentiments }: MarketSentimentProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "bullish":
        return "text-success"
      case "bearish":
        return "text-destructive"
      default:
        return "text-warning"
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-success" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-destructive" />
      default:
        return <Minus className="h-3 w-3 text-warning" />
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-display">Market Sentiment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sentiments.map((item, index) => (
          <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{item.stock}</span>
                {getTrendIcon(item.trend)}
              </div>
              <Badge
                variant={
                  item.sentiment === "Bullish" ? "default" : item.sentiment === "Bearish" ? "destructive" : "secondary"
                }
                className="text-xs"
              >
                {item.sentiment}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{item.confidence}%</span>
              </div>
              <Progress value={item.confidence} className="h-1.5" />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.newsCount} news articles</span>
                <span>{item.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
