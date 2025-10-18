"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"

interface SystemMetrics {
  uptime: string
  apiCalls: number
  errorRate: number
  responseTime: number
  activeUsers: number
  dbConnections: number
}

export default function MonitorDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: "99.9%",
    apiCalls: 15420,
    errorRate: 0.2,
    responseTime: 145,
    activeUsers: 23,
    dbConnections: 8,
  })

  const [systemStatus, setSystemStatus] = useState("healthy")

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 10),
        responseTime: 120 + Math.floor(Math.random() * 50),
        activeUsers: 20 + Math.floor(Math.random() * 10),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Monitor</h1>
          <p className="text-gray-600 mt-2">Real-time system performance and health monitoring</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                All systems operational
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uptime}</div>
              <p className="text-xs text-gray-600 mt-2">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.apiCalls.toLocaleString()}</div>
              <p className="text-xs text-gray-600 mt-2">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
              <p className="text-xs text-gray-600 mt-2">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Monitoring */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Performance</CardTitle>
                  <CardDescription>Response times and throughput</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Response Time</span>
                      <Badge variant="outline">{metrics.responseTime}ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Requests per Minute</span>
                      <Badge variant="outline">245</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <Badge variant="outline" className="text-green-600">
                        99.8%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Performance</CardTitle>
                  <CardDescription>Database connections and query performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Connections</span>
                      <Badge variant="outline">{metrics.dbConnections}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Query Time</span>
                      <Badge variant="outline">23ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Connection Pool</span>
                      <Badge variant="outline" className="text-green-600">
                        Healthy
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Error Monitoring</CardTitle>
                <CardDescription>Recent errors and system issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">API Rate Limit Warning</p>
                        <p className="text-sm text-gray-600">Approaching rate limit for Polygon API</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Warning
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Database Connection Restored</p>
                      <p className="text-sm text-gray-600">Connection pool back to normal</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Resolved
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>User activity and feature usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</div>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <p className="text-sm text-gray-600">Analyses Today</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">89%</div>
                    <p className="text-sm text-gray-600">User Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Configure and manage system alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">High Response Time Alert</p>
                      <p className="text-sm text-gray-600">Trigger when response time &gt; 500ms</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Error Rate Alert</p>
                      <p className="text-sm text-gray-600">Trigger when error rate &gt; 5%</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Database Connection Alert</p>
                      <p className="text-sm text-gray-600">Trigger when connections &gt; 80% of pool</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
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
