import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import FloatingChatbot from "@/components/floating-chatbot"

export const metadata: Metadata = {
  title: "QuantPredictPro - Stock Analyzer",
  description: "AI-powered stock analysis and prediction platform for informed investment decisions.",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
        <FloatingChatbot />
      </body>
    </html>
  )
}
