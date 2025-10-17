import { Suspense } from "react"
import StockDashboard from "@/components/stock-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import ProtectedNavigation from "@/components/protected-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProtectedNavigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ErrorBoundary>
          <Suspense fallback={<DashboardSkeleton />}>
            <StockDashboard />
          </Suspense>
        </ErrorBoundary>
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
