"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, TrendingUp, BarChart2, TrendingDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  ReferenceLine,
} from "recharts"

interface RiskAssessmentProps {
  data: {
    volatility: number
    var: number
    sharpeRatio: number
    maxDrawdown: number
    correlations: {
      spy: number
      sector: number
      competitors: number
    }
    stressTest: {
      scenario: string
      impact: number
    }[]
    historicalVolatility: {
      date: string
      volatility: number
    }[]
  }
}

export default function RiskAssessment({ data }: RiskAssessmentProps) {
  const getVolatilityLevel = (volatility: number) => {
    if (volatility > 0.3) return { level: "High", color: "bg-red-500" }
    if (volatility > 0.2) return { level: "Medium", color: "bg-yellow-500" }
    return { level: "Low", color: "bg-green-500" }
  }

  const getSharpeRating = (sharpe: number) => {
    if (sharpe > 1.5) return { rating: "Excellent", color: "bg-green-500" }
    if (sharpe > 1.0) return { rating: "Good", color: "bg-blue-500" }
    if (sharpe > 0.5) return { rating: "Fair", color: "bg-yellow-500" }
    return { rating: "Poor", color: "bg-red-500" }
  }

  const getCorrelationLevel = (correlation: number) => {
    if (correlation > 0.7) return { level: "High", color: "text-red-500" }
    if (correlation > 0.4) return { level: "Medium", color: "text-yellow-600" }
    return { level: "Low", color: "text-green-500" }
  }

  const volatilityLevel = getVolatilityLevel(data.volatility)
  const sharpeRating = getSharpeRating(data.sharpeRatio)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Volatility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(data.volatility * 100).toFixed(1)}%</div>
              <Badge className={`${volatilityLevel.color} text-white`}>{volatilityLevel.level}</Badge>
            </div>
            <Progress value={data.volatility * 100} className="h-3" />
            <p className="text-sm text-gray-600 text-center">Historical price fluctuation measure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Value at Risk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(data.var * 100).toFixed(1)}%</div>
              <Badge variant="outline">95% Confidence</Badge>
            </div>
            <Progress value={data.var * 100} className="h-3" />
            <p className="text-sm text-gray-600 text-center">Maximum expected loss over 1 day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{data.sharpeRatio.toFixed(2)}</div>
              <Badge className={`${sharpeRating.color} text-white`}>{sharpeRating.rating}</Badge>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 text-center">Risk-adjusted return measure</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="h-5 w-5" />
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(data.maxDrawdown * 100).toFixed(1)}%</div>
              <Badge variant="destructive">Peak to Trough</Badge>
            </div>
            <Progress value={data.maxDrawdown * 100} className="h-3" />
            <p className="text-sm text-gray-600 text-center">Largest historical decline</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="correlations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="stress">Stress Test</TabsTrigger>
          <TabsTrigger value="volatility">Volatility Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Market Correlations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">S&P 500 (SPY)</span>
                    <span className={`font-bold ${getCorrelationLevel(data.correlations.spy).color}`}>
                      {data.correlations.spy.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={data.correlations.spy * 100} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {getCorrelationLevel(data.correlations.spy).level} correlation with market
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sector Index</span>
                    <span className={`font-bold ${getCorrelationLevel(data.correlations.sector).color}`}>
                      {data.correlations.sector.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={data.correlations.sector * 100} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {getCorrelationLevel(data.correlations.sector).level} correlation with sector
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Competitors</span>
                    <span className={`font-bold ${getCorrelationLevel(data.correlations.competitors).color}`}>
                      {data.correlations.competitors.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={data.correlations.competitors * 100} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {getCorrelationLevel(data.correlations.competitors).level} correlation with peers
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Correlation Analysis</h4>
                <p className="text-sm text-gray-600">
                  This stock shows {getCorrelationLevel(data.correlations.spy).level.toLowerCase()} correlation with the
                  broader market, indicating it{" "}
                  {data.correlations.spy > 0.7 ? "moves closely" : "moves somewhat independently"}
                  with market trends. The {getCorrelationLevel(data.correlations.sector).level.toLowerCase()} sector
                  correlation suggests{" "}
                  {data.correlations.sector > 0.7 ? "strong sector influence" : "some sector independence"}.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Stress Test Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stressTest} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="scenario" type="category" width={120} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, "Impact"]} />
                    <ReferenceLine x={0} stroke="#000" />
                    <Bar dataKey="impact" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-3">
                {data.stressTest.map((test, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{test.scenario}</span>
                    <Badge variant={test.impact < -10 ? "destructive" : test.impact < -5 ? "secondary" : "outline"}>
                      {test.impact.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volatility">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historical Volatility Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.historicalVolatility}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      minTickGap={30}
                    />
                    <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <Tooltip
                      formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "Volatility"]}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="volatility"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <ReferenceLine y={data.volatility} stroke="red" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium mb-2">Volatility Insights</h4>
                <p className="text-sm text-gray-600">
                  Current volatility of {(data.volatility * 100).toFixed(1)}% is
                  {data.volatility > 0.25 ? " above" : " below"} the typical range for this asset class. Higher
                  volatility indicates greater price swings and increased risk, but also potential for higher returns.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
