"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StockDashboard from "@/components/stock-dashboard"
import AIInsightsDashboard from "@/components/ai-insights-dashboard"
import SystemTester from "@/components/system-tester"
import SystemStatus from "@/components/system-status"
import APIUsageMonitor from "@/components/api-usage-monitor"
import ErrorTestingSuite from "@/components/error-testing-suite"
import ProtectedNavigation from "@/components/protected-navigation"
import { ErrorBoundary } from "@/components/error-boundary"

export default function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState("analysis")

  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedNavigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <StockDashboard />
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <AIInsightsDashboard />
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemStatus />
                <APIUsageMonitor />
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemTester />
                <ErrorTestingSuite />
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
                <p className="text-gray-600">Configure and monitor data source connections</p>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">System Settings</h2>
                <p className="text-gray-600">Configure system parameters and preferences</p>
              </div>
            </TabsContent>
          </Tabs>
        </ErrorBoundary>
      </main>
    </div>
  )
}
