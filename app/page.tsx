import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Zap, Globe2, Cpu } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Transform Your Videos with{' '}
          <span className="text-primary">AI-Powered Effects</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Experience the future of video processing - powerful effects running directly in your browser,
          with optional cloud processing for demanding transformations.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/transform">
            <Button size="lg" className="gap-2">
              Start Transforming <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="space-y-4">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Client-Side Magic</h3>
          <p className="text-muted-foreground">
            Transform videos directly in your browser using WebAssembly-powered FFmpeg.
            No uploads needed for basic transformations.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Cloud Processing</h3>
          <p className="text-muted-foreground">
            Need more power? Switch to cloud processing for demanding transformations
            with our serverless infrastructure.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
            <Globe2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Universal Access</h3>
          <p className="text-muted-foreground">
            Works on any modern browser. No software installation required.
            Process videos from any device, anywhere.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Advanced Technology</h3>
          <p className="text-muted-foreground">
            Built with Next.js 14, Supabase, and FFmpeg WASM. Experience the cutting
            edge of web technology.
          </p>
        </div>
      </section>

      {/* Technical Showcase */}
      <section className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl font-bold">Built with Modern Tech</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            "Next.js 14",
            "FFmpeg WASM",
            "Supabase",
            "TypeScript",
            "TailwindCSS",
            "WebAssembly",
            "Edge Functions",
            "React Server Components"
          ].map((tech) => (
            <div 
              key={tech}
              className="bg-card p-4 rounded-lg border text-sm font-medium"
            >
              {tech}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold">Ready to Transform Your Videos?</h2>
        <p className="text-lg text-muted-foreground">
          Start with client-side processing for free, or sign up to unlock cloud processing capabilities.
        </p>
        <Link href="/transform">
          <Button size="lg" className="gap-2">
            Try It Now <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}
