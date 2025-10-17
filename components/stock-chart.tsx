"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts"

interface StockChartProps {
  ticker: string
  historicalData: {
    date: string
    price: number
    volume: number
    open: number
    high: number
    low: number
    close: number
  }[]
}

export default function StockChart({ ticker, historicalData }: StockChartProps) {
  const [chartType, setChartType] = useState<"line" | "area" | "candlestick">("line")

  // Safety check for data
  if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{ticker} Price Chart</CardTitle>
          <CardDescription>No historical data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-500">No chart data available</div>
        </CardContent>
      </Card>
    )
  }

  // Calculate moving averages with safety checks
  const sma20 = historicalData.map((item, index, array) => {
    if (index < 20) return { ...item, sma20: null }

    const sum = array.slice(index - 20, index).reduce((acc, val) => {
      const closePrice = val?.close || 0
      return acc + closePrice
    }, 0)
    return { ...item, sma20: sum / 20 }
  })

  const sma50 = sma20.map((item, index, array) => {
    if (index < 50) return { ...item, sma50: null }

    const sum = array.slice(index - 50, index).reduce((acc, val) => {
      const closePrice = val?.close || 0
      return acc + closePrice
    }, 0)
    return { ...item, sma50: sum / 50 }
  })

  const chartData = sma50

  // Calculate min and max for y-axis with safety checks
  const prices = historicalData.map((d) => d?.close || 0).filter((price) => price > 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.95 : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.05 : 100

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{ticker} Price Chart</CardTitle>
            <CardDescription>Historical price movement analysis</CardDescription>
          </div>
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)} className="w-[300px]">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="area">Area</TabsTrigger>
              <TabsTrigger value="candlestick">Volume</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {chartType === "line" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} minTickGap={30} />
                <YAxis domain={[minPrice, maxPrice]} />
                <Tooltip
                  formatter={(value: number) => [`$${(value || 0).toFixed(2)}`, "Price"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="close"
                  name="Price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="sma20"
                  name="SMA 20"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  name="SMA 50"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {chartType === "area" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} minTickGap={30} />
                <YAxis domain={[minPrice, maxPrice]} />
                <Tooltip
                  formatter={(value: number) => [`$${(value || 0).toFixed(2)}`, "Price"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="close"
                  name="Price"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
                <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#10b981" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="sma50" name="SMA 50" stroke="#8b5cf6" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === "candlestick" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} minTickGap={30} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [new Intl.NumberFormat().format(value || 0), "Volume"]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
