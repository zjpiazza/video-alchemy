import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import type { Metadata } from "next"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col gradient-bg">
            <div className="flex-grow">
              <main className="flex flex-col items-center">
                <div className="w-full max-w-7xl px-4">
                  <div className="flex justify-end py-4">
                    <ThemeToggle />
                  </div>

                  <div className="text-center mb-12 space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <h1 className="text-4xl font-bold">Video Alchemy</h1>
                    </div>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Transform your videos with powerful effects - right in your browser
                    </p>
                  </div>
                  {children}
                </div>
              </main>
            </div>
            
            <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
              <p>
                Powered by{' '}
                <a
                  href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
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
      </body>
    </html>
  );
}
