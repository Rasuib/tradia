import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface Stock {
  id: number
  name: string
  sector: string
  price: string
  change: string
  sentiment: string
  avatar: string
  isPositive: boolean
}

interface StockRankingProps {
  stocks: Stock[]
}

export default function StockRanking({ stocks }: StockRankingProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-display">Top Performers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stocks.map((stock, index) => (
          <div
            key={stock.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm font-mono text-muted-foreground w-6">#{index + 1}</div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={stock.avatar || "/placeholder.svg"} alt={stock.name} />
                <AvatarFallback className="text-xs">{stock.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{stock.name}</div>
                <div className="text-xs text-muted-foreground">{stock.sector}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm">{stock.price}</div>
              <div
                className={`flex items-center gap-1 text-xs ${stock.isPositive ? "text-success" : "text-destructive"}`}
              >
                {stock.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {stock.change}
              </div>
            </div>

            <Badge
              variant={
                stock.sentiment === "Bullish" ? "default" : stock.sentiment === "Bearish" ? "destructive" : "secondary"
              }
              className="text-xs"
            >
              {stock.sentiment}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
