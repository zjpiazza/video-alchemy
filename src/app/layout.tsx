import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "~/components/theme-provider"
import { Toaster } from "~/components/ui/toaster"
import { AuthProvider } from "~/contexts/auth-context"
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "~/components/landing/header"
import { DashboardSidebar } from "~/components/dashboard/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VideoAlchemy - Transform Videos with FFmpeg",
  description: "Transform videos right in your browser or with server-side processing.",
  generator: 'v0.dev'
}

function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (<div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900">
    <div className="flex min-h-screen w-full">
      <div className="h-full">
        <DashboardSidebar />
      </div>
      <main className="flex-1 w-full p-6">
        {children}
      </main>
    </div>
  </div>)

}

function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (<div className={`${inter.className} min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-950 dark:to-gray-900`}>
    <Header />
    <div className="w-full max-w-7xl px-4 md:px-8 mx-auto">
      <main>
        {children}
      </main>
    </div>
    <Toaster />
  </div>)
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <AuthProvider>
            <TRPCReactProvider>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                <SignedIn>
                  <AppLayout>{children}</AppLayout>
                </SignedIn>
                <SignedOut>
                  <PublicLayout>{children}</PublicLayout>
                </SignedOut>
                <Toaster />
              </ThemeProvider>
            </TRPCReactProvider>
          </AuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
