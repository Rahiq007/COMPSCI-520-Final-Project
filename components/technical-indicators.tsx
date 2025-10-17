"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Bar,
} from "recharts"

interface TechnicalIndicatorsProps {
  data: {
    rsi: number
    macd: {
      value: number
      signal: number
      histogram: number[]
    }
    sma: {
      sma20: number
      sma50: number
      sma200: number
    }
    ema: {
      ema12: number
      ema26: number
    }
    bollinger: {
      upper: number
      middle: number
      lower: number
      width: number
    }
    adx: number
    obv: number[]
    historicalRsi: number[]
    historicalMacd: {
      macd: number[]
      signal: number[]
      histogram: number[]
    }
  }
}

export default function TechnicalIndicators({ data }: TechnicalIndicatorsProps) {
  // Safety checks for data
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators</CardTitle>
          <CardDescription>No technical data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No technical indicators available
          </div>
        </CardContent>
      </Card>
    )
  }

  const safeData = {
    rsi: data.rsi || 50,
    macd: {
      value: data.macd?.value || 0,
      signal: data.macd?.signal || 0,
      histogram: data.macd?.histogram || [],
    },
    sma: {
      sma20: data.sma?.sma20 || 0,
      sma50: data.sma?.sma50 || 0,
      sma200: data.sma?.sma200 || 0,
    },
    ema: {
      ema12: data.ema?.ema12 || 0,
      ema26: data.ema?.ema26 || 0,
    },
    bollinger: {
      upper: data.bollinger?.upper || 0,
      middle: data.bollinger?.middle || 0,
      lower: data.bollinger?.lower || 0,
      width: data.bollinger?.width || 0,
    },
    adx: data.adx || 0,
    obv: data.obv || [],
    historicalRsi: data.historicalRsi || [],
    historicalMacd: {
      macd: data.historicalMacd?.macd || [],
      signal: data.historicalMacd?.signal || [],
      histogram: data.historicalMacd?.histogram || [],
    },
  }

  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { signal: "Overbought", color: "bg-red-500" }
    if (rsi < 30) return { signal: "Oversold", color: "bg-green-500" }
    return { signal: "Neutral", color: "bg-yellow-500" }
  }

  const getMACDSignal = (macd: { value: number; signal: number }) => {
    if (macd.value > macd.signal) return { signal: "Bullish", color: "bg-green-500" }
    return { signal: "Bearish", color: "bg-red-500" }
  }

  const getADXSignal = (adx: number) => {
    if (adx > 25) return { signal: "Strong Trend", color: "bg-green-500" }
    if (adx > 20) return { signal: "Developing Trend", color: "bg-yellow-500" }
    return { signal: "No Trend", color: "bg-gray-500" }
  }

  const rsiSignal = getRSISignal(safeData.rsi)
  const macdSignal = getMACDSignal(safeData.macd)
  const adxSignal = getADXSignal(safeData.adx)

  // Prepare data for RSI chart
  const rsiChartData = safeData.historicalRsi.map((value, index) => ({
    index,
    rsi: value || 50,
  }))

  // Prepare data for MACD chart
  const macdChartData = safeData.historicalMacd.macd.map((value, index) => ({
    index,
    macd: value || 0,
    signal: safeData.historicalMacd.signal[index] || 0,
    histogram: safeData.historicalMacd.histogram[index] || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Momentum Indicators</CardTitle>
            <CardDescription>RSI and MACD analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">RSI (14)</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{safeData.rsi.toFixed(1)}</span>
                  <Badge className={`${rsiSignal.color} text-white`}>{rsiSignal.signal}</Badge>
                </div>
              </div>
              <Progress value={safeData.rsi} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Oversold (30)</span>
                <span>Neutral</span>
                <span>Overbought (70)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">MACD</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{safeData.macd.value.toFixed(2)}</span>
                  <Badge className={`${macdSignal.color} text-white`}>{macdSignal.signal}</Badge>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>MACD: {safeData.macd.value.toFixed(2)}</span>
                <span>Signal: {safeData.macd.signal.toFixed(2)}</span>
                <span>Diff: {(safeData.macd.value - safeData.macd.signal).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ADX</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{safeData.adx.toFixed(1)}</span>
                  <Badge className={`${adxSignal.color} text-white`}>{adxSignal.signal}</Badge>
                </div>
              </div>
              <Progress value={safeData.adx} max={50} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Weak (20)</span>
                <span>Strong (25)</span>
                <span>Very Strong (50+)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moving Averages & Bollinger Bands</CardTitle>
            <CardDescription>Trend and volatility indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">SMA 20</p>
                <p className="text-xl font-bold text-blue-600">${safeData.sma.sma20.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">SMA 50</p>
                <p className="text-xl font-bold text-purple-600">${safeData.sma.sma50.toFixed(2)}</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">SMA 200</p>
                <p className="text-xl font-bold text-indigo-600">${safeData.sma.sma200.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Exponential Moving Averages</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">EMA 12</p>
                  <p className="text-xl font-bold text-green-600">${safeData.ema.ema12.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">EMA 26</p>
                  <p className="text-xl font-bold text-red-600">${safeData.ema.ema26.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Bollinger Bands</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm">Upper Band:</span>
                  <span className="font-medium">${safeData.bollinger.upper.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Middle Band:</span>
                  <span className="font-medium">${safeData.bollinger.middle.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Lower Band:</span>
                  <span className="font-medium">${safeData.bollinger.lower.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Band Width:</span>
                  <span className="font-medium">{safeData.bollinger.width.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rsi" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rsi">RSI Chart</TabsTrigger>
          <TabsTrigger value="macd">MACD Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="rsi">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {rsiChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rsiChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: number) => [`${(value || 0).toFixed(2)}`, "RSI"]} />
                      <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
                      <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="rsi" stroke="#8884d8" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No RSI data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macd">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                {macdChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={macdChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [`${(value || 0).toFixed(4)}`, ""]}
                        labelFormatter={(label) => `Period ${label}`}
                      />
                      <ReferenceLine y={0} stroke="#000" />
                      <Line type="monotone" dataKey="macd" name="MACD" stroke="#2563eb" dot={false} />
                      <Line type="monotone" dataKey="signal" name="Signal" stroke="#ef4444" dot={false} />
                      <Bar dataKey="histogram" name="Histogram" fill="#10b981" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No MACD data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
