"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function AnimatedHero() {
  // Set isLoaded to true immediately since we're not doing any async loading
  // This avoids any client/server hydration issues
  const isLoaded = true

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        {/* Animated particles */}
        {isLoaded && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/30"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * -100 - 50],
                  opacity: [0, 0.7, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5 + Math.random() * 10,
                  delay: Math.random() * 5,
                  ease: "easeInOut",
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Animated title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Transform Videos Using{" "}
              <motion.span
                className="text-primary inline-block"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              >
                VideoAlchemy
              </motion.span>
            </h1>
          </motion.div>

          {/* Animated subtitle */}
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            Transform videos right in your browser or let our powerful servers handle the heavy lifting. Professional
            video transformations made simple.
          </motion.p>

          {/* Animated flask icon */}
          <motion.div
            className="my-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.g
                  animate={{
                    rotate: [0, 2, 0, -2, 0],
                    y: [0, -2, 0, 2, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                  style={{ transformOrigin: "center" }}
                >
                  {/* Flask */}
                  <path
                    d="M35,35 L45,35 L60,85 Q60,95 40,95 Q20,95 20,85 L35,35"
                    className="fill-background stroke-primary"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  {/* Flask neck */}
                  <path
                    d="M35,25 L45,25 L45,35 Q40,37 35,35 Z"
                    className="fill-background stroke-primary"
                    strokeWidth="2"
                  />

                  {/* Cork */}
                  <path d="M36,15 L44,15 L44,20 Q40,22 36,20 Z" className="fill-primary" />
                  <path d="M38,20 L42,20 L42,25 Q40,27 38,25 Z" className="fill-primary/80" />

                  {/* Liquid */}
                  <motion.path
                    d="M20,85 C20,85 25,60 40,60 C55,60 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z"
                    className="fill-primary/50"
                    animate={{
                      d: [
                        "M20,85 C20,85 25,60 40,60 C55,60 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z",
                        "M20,85 C20,85 30,62 40,58 C50,55 60,82 60,85 Q60,90 40,90 Q20,90 20,85 Z",
                        "M20,85 C20,82 30,55 40,58 C50,62 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z",
                        "M20,85 C20,85 25,63 40,65 C55,63 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z",
                      ],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 4,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Bubbles */}
                  <motion.circle
                    className="fill-primary/70"
                    cx="30"
                    cy="70"
                    r="2"
                    animate={{ y: [-0, -20], opacity: [0.7, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, delay: 0 }}
                  />
                  <motion.circle
                    className="fill-primary/70"
                    cx="45"
                    cy="65"
                    r="1.5"
                    animate={{ y: [-0, -15], opacity: [0.7, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, delay: 0.5 }}
                  />
                  <motion.circle
                    className="fill-primary/70"
                    cx="35"
                    cy="75"
                    r="1.8"
                    animate={{ y: [-0, -25], opacity: [0.7, 0] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5, delay: 1 }}
                  />
                </motion.g>
              </svg>
            </div>
          </motion.div>

          {/* Animated buttons */}
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
          >
            <Button asChild size="lg" className="group">
              <Link href="/process">
                Try It Out
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, repeatDelay: 2, duration: 0.8 }}
                >
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#demo">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
