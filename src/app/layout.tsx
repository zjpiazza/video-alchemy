import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "~/components/theme-provider"
import { Toaster } from "~/components/ui/toaster"
import { AuthProvider } from "~/contexts/auth-context"
import { AuthToggle } from "~/components/auth-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VideoAlchemy - Transform Videos with FFmpeg",
  description: "Transform videos right in your browser or with server-side processing.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900`}
      >
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <AuthToggle />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
