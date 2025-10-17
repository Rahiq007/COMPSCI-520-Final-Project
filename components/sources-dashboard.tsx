"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertTriangle, Key, Activity } from "lucide-react"

export default function SourcesDashboard() {
  const [apiKeys, setApiKeys] = useState({
    polygon: "pk_test_***************",
    finnhub: "c***************",
    twelveData: "***************",
    alphaVantage: "***************",
  })

  const dataSources = [
    {
      name: "Polygon.io",
      status: "active",
      usage: 85,
      limit: 5000,
      requests: 4250,
      latency: "120ms",
      reliability: 99.8,
    },
    {
      name: "Finnhub",
      status: "active",
      usage: 45,
      limit: 1000,
      requests: 450,
      latency: "95ms",
      reliability: 99.5,
    },
    {
      name: "Twelve Data",
      status: "warning",
      usage: 92,
      limit: 800,
      requests: 736,
      latency: "180ms",
      reliability: 98.2,
    },
    {
      name: "Alpha Vantage",
      status: "inactive",
      usage: 15,
      limit: 500,
      requests: 75,
      latency: "250ms",
      reliability: 97.1,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
          <p className="text-gray-600 mt-2">Manage API keys, monitor usage, and configure data sources</p>
        </div>

        {/* Sources Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-600 mt-2">Out of 4 configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,511</div>
              <p className="text-xs text-gray-600 mt-2">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">161ms</div>
              <p className="text-xs text-gray-600 mt-2">Across all sources</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reliability</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.1%</div>
              <p className="text-xs text-gray-600 mt-2">Average uptime</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dataSources.map((source, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {source.status === "active" && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {source.status === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                        {source.status === "inactive" && <XCircle className="h-5 w-5 text-red-600" />}
                        <Badge
                          variant="outline"
                          className={
                            source.status === "active"
                              ? "text-green-600"
                              : source.status === "warning"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }
                        >
                          {source.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Usage</span>
                          <span>
                            {source.requests}/{source.limit} requests
                          </span>
                        </div>
                        <Progress value={source.usage} className="w-full" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Latency</p>
                          <p className="font-medium">{source.latency}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Reliability</p>
                          <p className="font-medium">{source.reliability}%</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Configure and manage API keys for data sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(apiKeys).map(([provider, key]) => (
                    <div key={provider} className="space-y-2">
                      <Label htmlFor={provider} className="text-sm font-medium capitalize">
                        {provider === "twelveData"
                          ? "Twelve Data"
                          : provider === "alphaVantage"
                            ? "Alpha Vantage"
                            : provider}
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id={provider}
                          type="password"
                          value={key}
                          onChange={(e) => setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))}
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm">
                          <Key className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Button>Save All Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Usage</CardTitle>
                  <CardDescription>API requests over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                      const usage = Math.floor(Math.random() * 1000) + 500
                      return (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{day}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(usage / 1500) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">{usage}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>Monthly API costs and projections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Current Month</p>
                        <p className="text-sm text-gray-600">Actual usage</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$127.50</p>
                        <p className="text-sm text-gray-600">15 days</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Projected Month</p>
                        <p className="text-sm text-gray-600">Based on current usage</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$255.00</p>
                        <p className="text-sm text-gray-600">Full month</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Budget Limit</p>
                        <p className="text-sm text-gray-600">Monthly budget</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$300.00</p>
                        <p className="text-sm text-green-600">Within budget</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Data Source Settings</CardTitle>
                <CardDescription>Configure global settings for data sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-failover</Label>
                      <p className="text-sm text-gray-600">Automatically switch to backup sources when primary fails</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rate limiting</Label>
                      <p className="text-sm text-gray-600">Enforce API rate limits to prevent overuse</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data caching</Label>
                      <p className="text-sm text-gray-600">Cache responses to reduce API calls</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usage alerts</Label>
                      <p className="text-sm text-gray-600">Send notifications when approaching limits</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="space-y-2">
                    <Label>Cache duration (minutes)</Label>
                    <Input type="number" defaultValue="5" className="w-32" />
                  </div>

                  <div className="space-y-2">
                    <Label>Request timeout (seconds)</Label>
                    <Input type="number" defaultValue="30" className="w-32" />
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Save Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
