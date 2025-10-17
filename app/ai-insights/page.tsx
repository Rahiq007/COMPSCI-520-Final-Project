import { Suspense } from "react"
import AIInsightsDashboard from "@/components/ai-insights-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import ProtectedNavigation from "@/components/protected-navigation"

export default function AIInsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedNavigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <Suspense fallback={<AIInsightsSkeleton />}>
            <AIInsightsDashboard />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}

function AIInsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  )
}
