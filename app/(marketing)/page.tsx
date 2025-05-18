import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FeatureCard } from "@/components/feature-card"
import { ArrowRight, Wand2, Shield, Zap, Layers, CloudCog } from "lucide-react"
import { AnimatedHero } from "@/components/animated-hero"

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      {/* Animated Hero Section */}
      <AnimatedHero />

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Wand2}
            title="Client-Side Processing"
            description="Transform videos directly in your browser with no uploads required. Perfect for quick edits and privacy-conscious users who want to keep their content local."
          />
          <FeatureCard
            icon={CloudCog}
            title="Server-Side Power"
            description="Unlock advanced transformations with our server-side processing. Perfect for demanding tasks like speed adjustments, high-quality compression, and watermarking."
          />
          <FeatureCard
            icon={Shield}
            title="Privacy First"
            description="Your videos never leave your device with client-side processing. For server-side tasks, we use secure, encrypted connections and delete your content after processing."
          />
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Optimized algorithms ensure your videos are processed quickly, whether you're using client or server-side processing. No more waiting hours for simple transformations."
          />
          <FeatureCard
            icon={Layers}
            title="Multiple Formats"
            description="Support for all popular video formats including MP4, WebM, and MOV. Convert between formats with a single click or optimize for specific platforms."
          />
          <FeatureCard
            icon={ArrowRight}
            title="Batch Processing"
            description="Transform multiple videos at once with our batch processing feature. Perfect for content creators who need to apply the same effect to multiple clips."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary/5 rounded-lg p-8">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Videos?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with client-side processing for free, or sign up to unlock powerful server-side transformations.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/process">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Built with Next.js and a dash of digital alchemy ✨</p>
      </div>
    </div>
  )
}
