"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, TrendingDown, Target } from "lucide-react"
import type { Notification } from "@/types/dashboard"

interface Trade {
  type: "buy" | "sell"
  quantity: number
  price: number
  timestamp: string
  symbol: string
}

interface TradingSimulatorProps {
  selectedStock?: {
    symbol: string
    price: number
    name: string
    market?: string
  } | null
  onNotification?: (notification: Omit<Notification, "id">) => void
  balance: number
  setBalance: (balance: number) => void
  positions: { [key: string]: number }
  setPositions: (
    positions: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number }),
  ) => void
  trades: Trade[]
  setTrades: (trades: Trade[] | ((prev: Trade[]) => Trade[])) => void
}

export default function TradingSimulator({
  selectedStock,
  onNotification,
  balance,
  setBalance,
  positions,
  setPositions,
  trades,
  setTrades,
}: TradingSimulatorProps) {
  const [quantity, setQuantity] = useState(1)

  const currentPrice = selectedStock?.price || 0
  const currentSymbol = selectedStock?.symbol || ""
  const stockName = selectedStock?.name || "No stock selected"
  const currencySymbol = selectedStock?.market === "IN" ? "₹" : "$"

  const executeTrade = (type: "buy" | "sell") => {
    if (!selectedStock || currentPrice === 0) {
      const errorNotification: Omit<Notification, "id"> = {
        title: "⚠️ No Stock Selected",
        message: "Please search and select a stock from the market data before trading.",
        timestamp: new Date().toISOString(),
        type: "error",
        read: false,
        priority: "medium",
      }
      console.log("[v0] No stock selected, sending error notification")
      onNotification?.(errorNotification)
      return
    }

    const cost = quantity * currentPrice
    const tradeTimestamp = new Date().toISOString()
    const displayTimestamp = new Date().toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const marketName = selectedStock.market === "IN" ? "Indian" : "US"

    console.log("[v0] Executing trade:", type, "for", currentSymbol, "quantity:", quantity, "cost:", cost)
    console.log("[v0] Current balance before trade:", balance)

    if (type === "buy") {
      if (cost <= balance) {
        const newBalance = balance - cost
        const newPositionCount = (positions[currentSymbol] || 0) + quantity

        setBalance(newBalance)
        setPositions((prev) => {
          const newPositions = {
            ...prev,
            [currentSymbol]: newPositionCount,
          }
          console.log("[v0] Updated positions after buy:", newPositions)
          return newPositions
        })

        const newTrade: Trade = {
          type: "buy",
          quantity,
          price: currentPrice,
          timestamp: displayTimestamp,
          symbol: currentSymbol,
        }
        setTrades((prev) => [newTrade, ...prev])

        const notification: Omit<Notification, "id"> = {
          title: `🟢 BUY ORDER EXECUTED`,
          message: `✅ Purchased ${quantity} shares of ${currentSymbol} (${selectedStock.name}) at ${currencySymbol}${currentPrice.toFixed(2)}/share
💰 Total Investment: ${cost.toLocaleString()} (Virtual)
💳 New Balance: ${newBalance.toLocaleString()} (Virtual)
📊 Total Shares Owned: ${newPositionCount}
🌍 Market: ${marketName}`,
          timestamp: tradeTimestamp,
          type: "trade_buy",
          read: false,
          priority: cost > 50000 ? "high" : cost > 10000 ? "medium" : "low",
        }

        console.log("[v0] Buy successful, new balance:", newBalance)
        console.log("[v0] Portfolio will update automatically with new balance and positions")
        onNotification?.(notification)
        playNotificationSound("success")
      } else {
        const notification: Omit<Notification, "id"> = {
          title: `🔴 BUY ORDER FAILED`,
          message: `❌ Insufficient virtual balance for ${quantity} shares of ${currentSymbol}
💰 Required: ${cost.toLocaleString()} (Virtual)
💳 Available: ${balance.toLocaleString()} (Virtual)
📉 Shortfall: ${(cost - balance).toLocaleString()}`,
          timestamp: new Date().toISOString(),
          type: "error",
          read: false,
          priority: "high",
        }
        console.log("[v0] Insufficient balance, sending error notification")
        onNotification?.(notification)
        playNotificationSound("error")
      }
    } else {
      const owned = positions[currentSymbol] || 0
      if (quantity <= owned) {
        const newBalance = balance + cost
        const remainingShares = owned - quantity

        setBalance(newBalance)
        setPositions((prev) => {
          const newPositions = {
            ...prev,
            [currentSymbol]: remainingShares,
          }
          console.log("[v0] Updated positions after sell:", newPositions)
          return newPositions
        })

        const newTrade: Trade = {
          type: "sell",
          quantity,
          price: currentPrice,
          timestamp: displayTimestamp,
          symbol: currentSymbol,
        }
        setTrades((prev) => [newTrade, ...prev])

        const notification: Omit<Notification, "id"> = {
          title: `🟡 SELL ORDER EXECUTED`,
          message: `✅ Sold ${quantity} shares of ${currentSymbol} (${selectedStock.name}) at ${currencySymbol}${currentPrice.toFixed(2)}/share
💰 Total Proceeds: ${cost.toLocaleString()} (Virtual)
💳 New Balance: ${newBalance.toLocaleString()} (Virtual)
📊 Remaining Shares: ${remainingShares}
🌍 Market: ${marketName}`,
          timestamp: tradeTimestamp,
          type: "trade_sell",
          read: false,
          priority: cost > 50000 ? "high" : cost > 10000 ? "medium" : "low",
        }
        console.log("[v0] Sell successful, new balance:", newBalance)
        console.log("[v0] Portfolio will update automatically with new balance and positions")
        onNotification?.(notification)
        playNotificationSound("success")
      } else {
        const notification: Omit<Notification, "id"> = {
          title: `🔴 SELL ORDER FAILED`,
          message: `❌ Insufficient shares to sell ${quantity} of ${currentSymbol}
📊 Available Shares: ${owned}
📉 Shortfall: ${quantity - owned} shares`,
          timestamp: new Date().toISOString(),
          type: "error",
          read: false,
          priority: "high",
        }
        console.log("[v0] Insufficient shares, sending error notification")
        onNotification?.(notification)
        playNotificationSound("error")
      }
    }
  }

  const getTradeDecision = (trade: Trade) => {
    const pnl =
      trade.type === "buy"
        ? (currentPrice - trade.price) * trade.quantity
        : (trade.price - currentPrice) * trade.quantity

    if (pnl > 50) return { status: "Good Decision", color: "text-green-400", icon: <TrendingUp className="w-4 h-4" /> }
    if (pnl < -50) return { status: "Bad Decision", color: "text-red-400", icon: <TrendingDown className="w-4 h-4" /> }
    return { status: "Neutral", color: "text-gray-400", icon: <Target className="w-4 h-4" /> }
  }

  const playNotificationSound = (type: "success" | "error" = "success") => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      const frequency = type === "success" ? 800 : 400
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)

      console.log("[v0] Trading notification sound played:", type)
    } catch (error) {
      console.log("[v0] Trading notification (audio unavailable):", error)

      if ("vibrate" in navigator) {
        const pattern = type === "success" ? [100, 50, 100] : [200, 100, 200, 100, 200]
        navigator.vibrate(pattern)
      }
    }
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Trading Simulator
        </CardTitle>
        {selectedStock && (
          <div className="text-sm text-gray-400">
            Trading: {stockName} ({currentSymbol}) - {currencySymbol}
            {currentPrice.toFixed(2)}
            <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded">
              {selectedStock.market === "IN" ? "Indian Market" : "US Market"}
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedStock && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <p className="text-yellow-400">Please search and select a stock to start trading</p>
          </div>
        )}

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Virtual Balance</span>
            <span className="text-2xl font-bold text-green-400">{balance.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400">Owned Shares</span>
            <span className="text-white">{positions[currentSymbol] || 0}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Quantity</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              className="bg-gray-800 border-gray-700 text-white"
              disabled={!selectedStock}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                console.log("[v0] Buy button clicked for", currentSymbol, "quantity:", quantity)
                executeTrade("buy")
              }}
              className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={!selectedStock || quantity * currentPrice > balance}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy {selectedStock ? (quantity * currentPrice).toLocaleString() : "0"}
            </Button>
            <Button
              onClick={() => {
                console.log("[v0] Sell button clicked for", currentSymbol, "quantity:", quantity)
                executeTrade("sell")
              }}
              className="bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={!selectedStock || quantity > (positions[currentSymbol] || 0)}
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell {selectedStock ? (quantity * currentPrice).toLocaleString() : "0"}
            </Button>
          </div>
        </div>

        {trades.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Recent Trades</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {trades.slice(0, 5).map((trade, index) => {
                const decision = getTradeDecision(trade)
                return (
                  <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            trade.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                          }
                        >
                          {trade.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-300">
                          {trade.quantity} @ {currencySymbol}
                          {trade.price.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{trade.timestamp}</span>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${decision.color}`}>
                      {decision.icon}
                      {decision.status}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-400 mb-1">💡 Learning Tip</p>
          <p className="text-xs text-gray-300">
            Practice with virtual money to understand market dynamics before real trading.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
