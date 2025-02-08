import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import type { Metadata } from "next"
import { Logo } from "@/components/logo"
import Navbar from "@/components/Navbar"
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Video Alchemy",
  description: "Transform your videos with powerful effects - right in your browser",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;

}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen flex flex-col gradient-bg">
              <Navbar />
              <main className="flex-grow flex flex-col items-center">
                <div className="w-full max-w-7xl px-4 py-8">
                  {children}
                </div>
              </main>
              <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
                <p>
                  Powered by{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Supabase
                  </a>
                </p>
              </footer>
            </div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
