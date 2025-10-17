"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Clock, Play, RotateCcw, FileText } from "lucide-react"

export default function TestingDashboard() {
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  const runTests = async () => {
    setIsRunningTests(true)
    setTestProgress(0)

    // Simulate test execution
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setTestProgress(i)
    }

    setIsRunningTests(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Testing Dashboard</h1>
          <p className="text-gray-600 mt-2">Automated testing and quality assurance</p>
        </div>

        {/* Test Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-gray-600 mt-2">Test cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">241</div>
              <p className="text-xs text-gray-600 mt-2">97.6% success rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">6</div>
              <p className="text-xs text-gray-600 mt-2">2.4% failure rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2h ago</div>
              <p className="text-xs text-gray-600 mt-2">Automated run</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Execution</CardTitle>
            <CardDescription>Run automated tests and view results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Button onClick={runTests} disabled={isRunningTests} className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>{isRunningTests ? "Running Tests..." : "Run All Tests"}</span>
              </Button>
              <Button variant="outline" disabled={isRunningTests}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            {isRunningTests && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Test Progress</span>
                  <span>{testProgress}%</span>
                </div>
                <Progress value={testProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Details */}
        <Tabs defaultValue="unit" className="space-y-6">
          <TabsList>
            <TabsTrigger value="unit">Unit Tests</TabsTrigger>
            <TabsTrigger value="integration">Integration Tests</TabsTrigger>
            <TabsTrigger value="performance">Performance Tests</TabsTrigger>
            <TabsTrigger value="security">Security Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="unit">
            <Card>
              <CardHeader>
                <CardTitle>Unit Test Results</CardTitle>
                <CardDescription>Individual component and function tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "API Client Tests", status: "passed", tests: 45, time: "2.3s" },
                    { name: "Prediction Model Tests", status: "passed", tests: 32, time: "1.8s" },
                    { name: "Data Validation Tests", status: "failed", tests: 28, time: "1.2s" },
                    { name: "Authentication Tests", status: "passed", tests: 15, time: "0.9s" },
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {test.status === "passed" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-600">
                            {test.tests} tests • {test.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={test.status === "passed" ? "text-green-600" : "text-red-600"}>
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration">
            <Card>
              <CardHeader>
                <CardTitle>Integration Test Results</CardTitle>
                <CardDescription>End-to-end system integration tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "API Integration Tests", status: "passed", tests: 18, time: "5.2s" },
                    { name: "Database Integration Tests", status: "passed", tests: 12, time: "3.1s" },
                    { name: "External API Tests", status: "passed", tests: 8, time: "4.7s" },
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-600">
                            {test.tests} tests • {test.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Test Results</CardTitle>
                <CardDescription>Load testing and performance benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Load Test Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Concurrent Users</span>
                        <span>100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Response Time</span>
                        <span>145ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Throughput</span>
                        <span>245 req/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate</span>
                        <span className="text-green-600">0.2%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Stress Test Results</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Peak Users</span>
                        <span>500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Breaking Point</span>
                        <span>750 users</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recovery Time</span>
                        <span>12s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge variant="outline" className="text-green-600">
                          Passed
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Test Results</CardTitle>
                <CardDescription>Security vulnerability and penetration tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Authentication Security", status: "passed", severity: "high", issues: 0 },
                    { name: "API Security", status: "passed", severity: "high", issues: 0 },
                    { name: "Data Validation", status: "warning", severity: "medium", issues: 2 },
                    { name: "Input Sanitization", status: "passed", severity: "high", issues: 0 },
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {test.status === "passed" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">{test.name}</p>
                          <p className="text-sm text-gray-600">
                            {test.issues} issues found • {test.severity} priority
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={test.status === "passed" ? "text-green-600" : "text-yellow-600"}
                      >
                        {test.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
