"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react"

interface ChartDataPoint {
  time: string
  price: number
  timestamp: number
}

interface RealTimeStockChartProps {
  symbol: string
  currentPrice: number
  change: number
  changePercent: number
  currency: string
  onPriceUpdate?: (price: number, change: number, changePercent: number) => void
}

export default function RealTimeStockChart({
  symbol,
  currentPrice: initialPrice,
  change: initialChange,
  changePercent: initialChangePercent,
  currency,
  onPriceUpdate,
}: RealTimeStockChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [timeRange, setTimeRange] = useState("1D")
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [currentPrice, setCurrentPrice] = useState(initialPrice)
  const [change, setChange] = useState(initialChange)
  const [changePercent, setChangePercent] = useState(initialChangePercent)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Effect for fetching the full historical chart data
  useEffect(() => {
    const fetchFullChart = async () => {
      if (!symbol) return
      setLoading(true)
      setIsRefreshing(true)
      try {
        const response = await fetch(`/api/stock/${symbol}/chart?range=${timeRange}`)
        const data = await response.json()
        if (data.chartData) {
          setChartData(data.chartData)
          // Set initial price from the last point of the chart data to avoid discrepancy
          const lastPoint = data.chartData[data.chartData.length - 1]
          if (lastPoint) {
            setCurrentPrice(lastPoint.price)
          }
        }
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchFullChart()
  }, [symbol, timeRange]) // This effect runs only when the symbol or timeRange changes

  // Effect for fetching only the latest price on an interval
  useEffect(() => {
    const fetchLatestPrice = async () => {
      if (!symbol) return
      setIsRefreshing(true) // Indicate a background refresh is happening
      try {
        const response = await fetch(`/api/stock/${symbol}`)
        const priceData = await response.json()

        if (priceData.price) {
          setCurrentPrice(priceData.price)
          setChange(priceData.change)
          setChangePercent(priceData.changePercent)

          if (onPriceUpdate) {
            onPriceUpdate(priceData.price, priceData.change, priceData.changePercent)
          }

          // Optional: Add the new price point to the chart if viewing '1D'
          if (timeRange === "1D") {
            const newPoint: ChartDataPoint = {
              time: new Date().toLocaleTimeString(),
              price: priceData.price,
              timestamp: Date.now(),
            }
            // Add the new point and remove the oldest if the list gets too long
            setChartData(prevData => [...prevData.slice(1), newPoint])
          }
        }
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to fetch latest price:", error)
      } finally {
        setIsRefreshing(false)
      }
    }

    const interval = setInterval(fetchLatestPrice, 3000)

    // Cleanup interval on component unmount or when dependencies change
    return () => clearInterval(interval)
  }, [symbol, onPriceUpdate, timeRange]) // Re-evaluate if these change

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    if (timeRange === "1D") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatPrice = (value: number) => {
    return `${currency === "INR" ? "₹" : "$"}${value.toFixed(2)}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{formatTime(label)}</p>
          <p className="text-white font-semibold">{formatPrice(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            {symbol} Price Chart
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              Auto-refresh every 3s
            </Badge>
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="1D">1D</SelectItem>
              <SelectItem value="5D">5D</SelectItem>
              <SelectItem value="1M">1M</SelectItem>
              <SelectItem value="3M">3M</SelectItem>
              <SelectItem value="1Y">1Y</SelectItem>
              <SelectItem value="ALL">ALL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-400">$ {symbol} Price</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white">{formatPrice(currentPrice)}</span>
            <Badge
              className={`flex items-center gap-1 ${
                change >= 0
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-white font-medium">
            {symbol} Price Chart ({timeRange})
          </h3>

          {loading && chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center bg-gray-800/30 rounded-lg">
              <p className="text-gray-400">Loading chart data...</p>
            </div>
          ) : (
            <div className="h-80 bg-gray-800/30 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatTime}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    tickFormatter={(value: number) => value.toFixed(2)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#06B6D4" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <p className="text-xs text-gray-500 text-right flex items-center justify-end gap-1">
            <div className={`w-2 h-2 rounded-full ${isRefreshing ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
