"use client"

import { useState, createContext, useEffect } from "react"
import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import StockRanking from "@/components/dashboard/stock-ranking"
import MarketSentiment from "@/components/dashboard/market-sentiment"
import StockSearchPanel from "@/components/dashboard/stock-search-panel"
import TradingSimulator from "@/components/dashboard/trading-simulator"
import MultiStockComparison from "@/components/dashboard/multi-stock-comparison"
import Notifications from "@/components/dashboard/notifications"
import TrendingUpIcon from "@/components/icons/trending-up"
import DollarSignIcon from "@/components/icons/dollar-sign"
import BarChartIcon from "@/components/icons/bar-chart"
import ActivityIcon from "@/components/icons/activity"
import MarketNewsView from "@/components/dashboard/market-news-view" // Import MarketNewsView
import Watchlist from "@/components/dashboard/watchlist" // Import Watchlist

import { useNavigation } from "@/components/dashboard/navigation-context"
import type { Notification } from "@/types/dashboard"
import mockData from "@/mock.json"

type NavigationContextType = {
  activeView: string
  setActiveView: (view: string) => void
}

const NavigationContext = createContext<NavigationContextType | null>(null)

const stockRankings = [
  // US Stocks (USD)
  {
    id: 1,
    name: "AAPL",
    sector: "Technology",
    price: "$189.25",
    change: "+2.34%",
    sentiment: "Bullish",
    avatar: "/avatars/aapl.png",
    isPositive: true,
    market: "US",
  },
  {
    id: 2,
    name: "GOOGL",
    sector: "Technology",
    price: "$142.80",
    change: "+1.87%",
    sentiment: "Bullish",
    avatar: "/avatars/googl.png",
    isPositive: true,
    market: "US",
  },
  {
    id: 3,
    name: "MSFT",
    sector: "Technology",
    price: "$378.45",
    change: "-0.45%",
    sentiment: "Neutral",
    avatar: "/avatars/msft.png",
    isPositive: false,
    market: "US",
  },
  {
    id: 4,
    name: "TSLA",
    sector: "Automotive",
    price: "$248.60",
    change: "+0.92%",
    sentiment: "Bullish",
    avatar: "/avatars/tsla.png",
    isPositive: true,
    market: "US",
  },
  {
    id: 5,
    name: "AMZN",
    sector: "E-commerce",
    price: "$155.30",
    change: "+1.25%",
    sentiment: "Bullish",
    avatar: "/avatars/amzn.png",
    isPositive: true,
    market: "US",
  },
  {
    id: 6,
    name: "NVDA",
    sector: "Technology",
    price: "$875.20",
    change: "+3.15%",
    sentiment: "Bullish",
    avatar: "/avatars/nvda.png",
    isPositive: true,
    market: "US",
  },
  // Indian Stocks (INR) - Combined NSE & BSE
  {
    id: 7,
    name: "RELIANCE",
    sector: "Energy",
    price: "₹2,847.50",
    change: "+1.45%",
    sentiment: "Bullish",
    avatar: "/avatars/reliance.png",
    isPositive: true,
    market: "IN",
  },
  {
    id: 8,
    name: "TCS",
    sector: "IT Services",
    price: "₹3,925.80",
    change: "+0.87%",
    sentiment: "Bullish",
    avatar: "/avatars/tcs.png",
    isPositive: true,
    market: "IN",
  },
  {
    id: 9,
    name: "HDFCBANK",
    sector: "Banking",
    price: "₹1,642.30",
    change: "-0.23%",
    sentiment: "Neutral",
    avatar: "/avatars/hdfc.png",
    isPositive: false,
    market: "IN",
  },
  {
    id: 10,
    name: "INFOSYS",
    sector: "IT Services",
    price: "₹1,789.45",
    change: "+2.15%",
    sentiment: "Bullish",
    avatar: "/avatars/infosys.png",
    isPositive: true,
    market: "IN",
  },
  {
    id: 11,
    name: "ICICIBANK",
    sector: "Banking",
    price: "₹1,234.60",
    change: "+0.65%",
    sentiment: "Bullish",
    avatar: "/avatars/icici.png",
    isPositive: true,
    market: "IN",
  },
  {
    id: 12,
    name: "BHARTIARTL",
    sector: "Telecom",
    price: "₹1,567.25",
    change: "+1.78%",
    sentiment: "Bullish",
    avatar: "/avatars/bharti.png",
    isPositive: true,
    market: "IN",
  },
]

const marketSentiments = [
  {
    stock: "S&P 500",
    sentiment: "Bullish",
    confidence: 78,
    newsCount: 245,
    lastUpdated: "2 mins ago",
    trend: "up" as const,
  },
  {
    stock: "NASDAQ",
    sentiment: "Bullish",
    confidence: 72,
    newsCount: 189,
    lastUpdated: "5 mins ago",
    trend: "up" as const,
  },
  {
    stock: "NIFTY 50",
    sentiment: "Bullish",
    confidence: 68,
    newsCount: 156,
    lastUpdated: "3 mins ago",
    trend: "up" as const,
  },
  {
    stock: "SENSEX",
    sentiment: "Neutral",
    confidence: 52,
    newsCount: 89,
    lastUpdated: "7 mins ago",
    trend: "neutral" as const,
  },
]

const iconMap = {
  "dollar-sign": DollarSignIcon,
  "bar-chart": BarChartIcon,
  "trending-up": TrendingUpIcon,
  activity: ActivityIcon,
}

export default function TradiaOverview() {
  const [selectedStock, setSelectedStock] = useState<{
    symbol: string
    price: number
    name: string
    market?: string
  } | null>(null)

  const [notifications, setNotifications] = useState<Notification[]>(mockData.notifications)

  const [trades, setTrades] = useState<
    {
      type: "buy" | "sell"
      quantity: number
      price: number
      timestamp: string
      symbol: string
    }[]
  >([])

  const [balance, setBalance] = useState(100000)
  const [positions, setPositions] = useState<{ [key: string]: number }>({})
  const initialBalance = 100000

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedPositions = localStorage.getItem("tradia_positions")
        const savedTrades = localStorage.getItem("tradia_trades")

        if (savedPositions) {
          setPositions(JSON.parse(savedPositions))
        }
        if (savedTrades) {
          setTrades(JSON.parse(savedTrades))
        }
      } catch (error) {
        console.log("[v0] Error loading persisted trading data:", error)
      }
    }
  }, [])

  const persistTradingData = (newBalance: number, newPositions: { [key: string]: number }, newTrades: any[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tradia_positions", JSON.stringify(newPositions))
        localStorage.setItem("tradia_trades", JSON.stringify(newTrades))
      } catch (error) {
        console.log("[v0] Error persisting trading data:", error)
      }
    }
  }

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance)
    persistTradingData(newBalance, positions, trades)
  }

  const updatePositions = (
    newPositions: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number }),
  ) => {
    if (typeof newPositions === "function") {
      setPositions((prev) => {
        const updated = newPositions(prev)
        persistTradingData(balance, updated, trades)
        return updated
      })
    } else {
      setPositions(newPositions)
      persistTradingData(balance, newPositions, trades)
    }
  }

  const updateTrades = (newTrades: any[] | ((prev: any[]) => any[])) => {
    if (typeof newTrades === "function") {
      setTrades((prev) => {
        const updated = newTrades(prev)
        persistTradingData(balance, positions, updated)
        return updated
      })
    } else {
      setTrades(newTrades)
      persistTradingData(balance, positions, newTrades)
    }
  }

  const [watchlist, setWatchlist] = useState<
    {
      symbol: string
      name: string
      price: string
      change: string
      isPositive: boolean
      sector?: string
      market?: string
    }[]
  >([
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: "$189.25",
      change: "+2.34%",
      isPositive: true,
      sector: "Technology",
      market: "US",
    },
    {
      symbol: "RELIANCE",
      name: "Reliance Industries",
      price: "₹2,847.50",
      change: "+1.45%",
      isPositive: true,
      sector: "Energy",
      market: "IN",
    },
  ])

  const addToWatchlist = (stock: {
    symbol: string
    name: string
    price: string
    change: string
    isPositive: boolean
    sector?: string
    market?: string
  }) => {
    // Check if stock already exists
    if (watchlist.some((item) => item.symbol === stock.symbol)) {
      return false // Stock already in watchlist
    }
    setWatchlist((prev) => [...prev, stock])
    return true // Successfully added
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((prev) => prev.filter((stock) => stock.symbol !== symbol))
  }

  const calculatePortfolioValue = () => {
    // Calculate current market value of all positions
    let positionsValue = 0
    Object.entries(positions).forEach(([symbol, quantity]) => {
      const stockData = stockRankings.find((stock) => stock.name === symbol)
      let currentPrice = 0

      if (stockData) {
        // Extract price from string format "$189.25" or "₹2,847.50"
        const priceStr = stockData.price.replace(/[$₹,]/g, "")
        currentPrice = Number.parseFloat(priceStr)

        // Convert INR to USD for portfolio calculation (approximate rate: 1 USD = 83 INR)
        if (stockData.market === "IN") {
          currentPrice = currentPrice / 83
        }
      } else if (selectedStock?.symbol === symbol) {
        // Use selected stock price if available
        currentPrice = selectedStock.price
      } else {
        // Mock prices in USD equivalent
        const mockPrices: { [key: string]: number } = {
          AAPL: 189.25,
          GOOGL: 142.8,
          MSFT: 378.45,
          TSLA: 248.6,
          AMZN: 155.3,
          NVDA: 875.2,
          RELIANCE: 34.31, // ₹2,847.50 / 83
          TCS: 47.29, // ₹3,925.80 / 83
          HDFCBANK: 19.78, // ₹1,642.30 / 83
          INFOSYS: 21.56, // ₹1,789.45 / 83
          ICICIBANK: 14.87, // ₹1,234.60 / 83
          BHARTIARTL: 18.88, // ₹1,567.25 / 83
        }
        currentPrice = mockPrices[symbol] || 0
      }

      positionsValue += quantity * currentPrice
    })

    return balance + positionsValue
  }

  const portfolioValue = calculatePortfolioValue()
  const portfolioChange = portfolioValue - initialBalance
  const portfolioChangePercent = ((portfolioChange / initialBalance) * 100).toFixed(2)

  const tradingStats = [
    {
      label: "Virtual Portfolio Value",
      value: `${balance}`,
      description: `${portfolioChangePercent}% from initial (Virtual)`,
      icon: "dollar-sign",
      tag: `${portfolioChange >= 0 ? "+" : ""}${portfolioChange.toLocaleString()}`,
      intent: (portfolioChange >= 0 ? "success" : "destructive") as const,
      direction: (portfolioChange >= 0 ? "up" : "down") as const,
    },
    {
      label: "Active Positions",
      value: Object.keys(positions)
        .filter((symbol) => positions[symbol] > 0)
        .length.toString(),
      description: "Across US & Indian markets",
      icon: "bar-chart",
      tag: "+2 today",
      intent: "success" as const,
      direction: "up" as const,
    },
    {
      label: "Market Sentiment",
      value: "Bullish",
      description: "Based on 1.2K news",
      icon: "trending-up",
      tag: "78% positive",
      intent: "success" as const,
      direction: "up" as const,
    },
    {
      label: "Learning Score",
      value: "B+",
      description: "Decision accuracy",
      icon: "activity",
      tag: "Improving",
      intent: "warning" as const,
      direction: "up" as const,
    },
  ]

  const handleAddNotification = (notification: Omit<Notification, "id">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    console.log("[v0] Adding new notification:", newNotification)
    console.log("[v0] Current portfolio value:", portfolioValue.toLocaleString())
    console.log("[v0] Current balance:", balance.toLocaleString())
    console.log("[v0] Current positions:", positions)
    setNotifications((prev) => {
      const updated = [newNotification, ...prev]
      console.log("[v0] Updated notifications array length:", updated.length)
      return updated
    })
  }

  const handleClearAllNotifications = () => {
    setNotifications([])
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const { currentView } = useNavigation()

  const renderActiveView = () => {
    switch (currentView) {
      case "analysis":
        return (
          <StockAnalysisView
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
            onNotification={handleAddNotification}
            balance={balance}
            setBalance={updateBalance}
            positions={positions}
            setPositions={updatePositions}
            trades={trades}
            setTrades={updateTrades}
            addToWatchlist={addToWatchlist}
          />
        )
      case "portfolio":
        return (
          <PortfolioView
            tradingStats={tradingStats}
            watchlist={watchlist}
            addToWatchlist={addToWatchlist}
            removeFromWatchlist={removeFromWatchlist}
          />
        )
      case "news":
        return <MarketNewsView />
      case "simulator":
        return (
          <TradingSimulatorView
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
            onNotification={handleAddNotification}
            balance={balance}
            setBalance={updateBalance}
            positions={positions}
            setPositions={updatePositions}
            trades={trades}
            setTrades={updateTrades}
            tradingStats={tradingStats}
          />
        )
      default:
        return (
          <DashboardView
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
            onNotification={handleAddNotification}
            balance={balance}
            setBalance={updateBalance}
            positions={positions}
            setPositions={updatePositions}
            trades={trades}
            setTrades={updateTrades}
            tradingStats={tradingStats}
            addToWatchlist={addToWatchlist}
          />
        )
    }
  }

  return (
    <DashboardPageLayout
      header={{
        title: getViewTitle(currentView),
        description: getViewDescription(currentView),
        icon: getViewIcon(currentView),
      }}
      sidebar={
        <Notifications
          initialNotifications={notifications}
          notifications={notifications}
          onAddNotification={handleAddNotification}
          onClearAll={handleClearAllNotifications}
          onDelete={handleDeleteNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      }
    >
      {renderActiveView()}
    </DashboardPageLayout>
  )
}

function getViewTitle(view: string) {
  switch (view) {
    case "analysis":
      return "Stock Analysis"
    case "portfolio":
      return "Portfolio Management"
    case "news":
      return "Market News"
    case "simulator":
      return "Trading Simulator"
    default:
      return "Market Overview"
  }
}

function getViewDescription(view: string) {
  switch (view) {
    case "analysis":
      return "Real-time stock analysis and sentiment"
    case "portfolio":
      return "Manage your investment portfolio"
    case "news":
      return "Latest market news and updates"
    case "simulator":
      return "Practice trading with virtual money"
    default:
      return "Live market data • Last updated 12:05"
  }
}

function getViewIcon(view: string) {
  switch (view) {
    case "analysis":
      return TrendingUpIcon
    case "portfolio":
      return DollarSignIcon
    case "news":
      return ActivityIcon
    case "simulator":
      return BarChartIcon
    default:
      return TrendingUpIcon
  }
}

function DashboardView({
  selectedStock,
  onStockSelect,
  onNotification,
  balance,
  setBalance,
  positions,
  setPositions,
  trades,
  setTrades,
  tradingStats,
  addToWatchlist,
}: {
  selectedStock: any
  onStockSelect: any
  onNotification: any
  balance: number
  setBalance: (balance: number) => void
  positions: { [key: string]: number }
  setPositions: (
    positions: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number }),
  ) => void
  trades: any[]
  setTrades: (trades: any[] | ((prev: any[]) => any[])) => void
  tradingStats: any[]
  addToWatchlist: any
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {tradingStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StockRanking stocks={stockRankings} />
        <MarketSentiment sentiments={marketSentiments} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StockSearchPanel onStockSelect={onStockSelect} addToWatchlist={addToWatchlist} />
        <TradingSimulator
          selectedStock={selectedStock}
          onNotification={onNotification}
          balance={balance}
          setBalance={setBalance}
          positions={positions}
          setPositions={setPositions}
          trades={trades}
          setTrades={setTrades}
        />
      </div>

      <div className="mb-6">
        <MultiStockComparison />
      </div>
    </>
  )
}

function StockAnalysisView({
  selectedStock,
  onStockSelect,
  onNotification,
  balance,
  setBalance,
  positions,
  setPositions,
  trades,
  setTrades,
  addToWatchlist,
}: {
  selectedStock: any
  onStockSelect: any
  onNotification: any
  balance: number
  setBalance: (balance: number) => void
  positions: { [key: string]: number }
  setPositions: (
    positions: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number }),
  ) => void
  trades: any[]
  setTrades: (trades: any[] | ((prev: any[]) => any[])) => void
  addToWatchlist: any
}) {
  return (
    <div className="space-y-6">
      <StockSearchPanel onStockSelect={onStockSelect} addToWatchlist={addToWatchlist} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MarketSentiment sentiments={marketSentiments} />
        <StockRanking stocks={stockRankings} />
      </div>
      <MultiStockComparison />
    </div>
  )
}

function PortfolioView({
  tradingStats,
  watchlist,
  addToWatchlist,
  removeFromWatchlist,
}: {
  tradingStats: any[]
  watchlist: any[]
  addToWatchlist: any
  removeFromWatchlist: any
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tradingStats.slice(0, 3).map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Watchlist watchlist={watchlist} addToWatchlist={addToWatchlist} removeFromWatchlist={removeFromWatchlist} />
        <StockRanking stocks={stockRankings} />
      </div>
    </div>
  )
}

function TradingSimulatorView({
  selectedStock,
  onStockSelect,
  onNotification,
  balance,
  setBalance,
  positions,
  setPositions,
  trades,
  setTrades,
  tradingStats,
}: {
  selectedStock: any
  onStockSelect: any
  onNotification: any
  balance: number
  setBalance: (balance: number) => void
  positions: { [key: string]: number }
  setPositions: (
    positions: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number }),
  ) => void
  trades: any[]
  setTrades: (trades: any[] | ((prev: any[]) => any[])) => void
  tradingStats: any[]
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockSearchPanel onStockSelect={onStockSelect} />
        <TradingSimulator
          selectedStock={selectedStock}
          onNotification={onNotification}
          balance={balance}
          setBalance={setBalance}
          positions={positions}
          setPositions={setPositions}
          trades={trades}
          setTrades={setTrades}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tradingStats.slice(0, 2).map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>
    </div>
  )
}
