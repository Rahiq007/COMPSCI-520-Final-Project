import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import FloatingChatbot from "@/components/floating-chatbot"
import RegisterServiceWorker from "@/components/register-sw"

export const metadata: Metadata = {
  title: "StockPilot - Stock Analyzer",
  description: "AI-powered stock analysis and prediction platform for informed investment decisions.",
  generator: "v0.dev",
  applicationName: 'StockPilot',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StockPilot',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon.ico' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StockPilot" />
      </head>
      <body>
        {children}
        <Toaster />
        <FloatingChatbot />
        <RegisterServiceWorker />
      </body>
    </html>
  )
}