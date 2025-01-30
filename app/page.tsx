import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles, Cpu } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/server"





export default async function LandingPage() {

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()



  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}

      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Transform Videos Using{' '}
          <span className="text-primary">FFmpeg</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform videos right here in your browser.
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Or upload and let us do the heavy lifting.
        </p>
        <div className="flex justify-center gap-4">

          <Link href="/transform">


            <Button size="lg" className="gap-2">
              Try It Out <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>ffmpeg.wasm</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-muted-foreground">
            <p>
              Allows you to run FFmpeg directly in your browser. 
              It&apos;s pretty neat, but you will have some serious performance limitations compared to running it natively.
              If you need more power, you can use server-side processing feature.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <CardTitle>trigger.dev</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-muted-foreground">
            <p>
              We use Supabase for the backend for this project. 
              Although Supabase is fantastic, there are some limitations to it.
              Edge functions are extremely limited in terms of compute resources.
              That&apos;s why we use trigger.dev to run the FFmpeg commands.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Simple Tech Stack */}
      <section className="max-w-3xl mx-auto text-center space-y-6">
        <p className="text-sm text-muted-foreground">
          Built with Next.js, Supabase, trigger.dev, ffmpeg.wasm, and a dash of dark magic 🧪
        </p>
      </section>
    </div>

  )
}

