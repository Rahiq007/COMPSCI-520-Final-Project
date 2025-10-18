"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Brain, LogOut, Shield } from "lucide-react"

export default function ProtectedNavigation() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/status")
      const data = await response.json()
      setIsAdmin(data.isAdmin)
    } catch (error) {
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      setIsAdmin(false)
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (isLoading) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Only show navigation for non-admin pages
  if (
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/monitor") ||
    pathname.startsWith("/testing") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/ai-insights")
  ) {
    return null
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">QuantPredict Pro</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Link href="/admin/dashboard">
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin Panel
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
