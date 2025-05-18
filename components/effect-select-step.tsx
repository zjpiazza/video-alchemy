"use client"

import { useTransformation } from "@/contexts/transformation-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getClientSupportedEffects, getServerSupportedEffects } from "@/lib/transformation-effects"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Laptop, Server } from "lucide-react"
import { EffectCard } from "@/components/effect-card"

interface EffectSelectStepProps {
  isLoggedIn: boolean
}

export function EffectSelectStep({ isLoggedIn = false }: EffectSelectStepProps) {
  const { videoFile, selectEffect, prevStep } = useTransformation()
  const clientEffects = getClientSupportedEffects()
  const serverEffects = getServerSupportedEffects()

  if (!videoFile) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Choose an Effect</h2>
        <Button variant="ghost" onClick={prevStep}>
          Back
        </Button>
      </div>

      <div className="aspect-video w-full max-h-[300px] bg-black rounded-lg overflow-hidden">
        <video src={videoFile.url} className="w-full h-full object-contain" controls />
      </div>

      <Tabs defaultValue="client">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="client" className="flex items-center gap-2">
            <Laptop className="h-4 w-4" />
            <span>Client-Side Effects</span>
          </TabsTrigger>
          <TabsTrigger value="server" disabled={!isLoggedIn} className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>Server-Side Effects</span>
            {!isLoggedIn && (
              <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-sm ml-1">
                Sign in required
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientEffects.map((effect) => (
              <EffectCard key={effect.id} effect={effect} onClick={() => selectEffect(effect.id)} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="server" className="mt-4">
          {isLoggedIn ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serverEffects.map((effect) => (
                <EffectCard key={effect.id} effect={effect} onClick={() => selectEffect(effect.id)} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Server-Side Processing</CardTitle>
                <CardDescription>
                  Sign in to unlock advanced video transformations with server-side processing.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild>
                  <a href="/sign-in">Sign In</a>
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
