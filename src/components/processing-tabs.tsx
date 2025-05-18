"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Laptop, Server, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"

interface ProcessingTabsProps {
  isLoggedIn: boolean
  children: React.ReactNode
  serverContent?: React.ReactNode
}

export function ProcessingTabs({ isLoggedIn, children, serverContent }: ProcessingTabsProps) {
  const [activeTab, setActiveTab] = useState("client")

  return (
    <Tabs defaultValue="client" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="client" className="flex items-center gap-2">
          <Laptop className="h-4 w-4" />
          <span>Client Processing</span>
        </TabsTrigger>
        <TabsTrigger value="server" className="flex items-center gap-2" disabled={!isLoggedIn}>
          <Server className="h-4 w-4" />
          <span>Server Processing</span>
          {!isLoggedIn && (
            <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-sm ml-1">
              Sign in required
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="client" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Client-Side Processing</CardTitle>
            <CardDescription>
              Using FFmpeg.wasm to process videos directly in your browser. This method runs entirely on your device,
              ensuring privacy and immediate results without uploading files to a server.
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="server" className="mt-0">
        <Card>
          <CardHeader>
            <CardTitle>Server-Side Processing</CardTitle>
            <CardDescription>
              Unlock more powerful video transformations with server-side processing. Ideal for demanding tasks that
              require more computational resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              serverContent || children
            ) : (
              <Alert variant="warning" className="bg-amber-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication required</AlertTitle>
                <AlertDescription>
                  Please sign in to unlock server-side processing for more demanding transformations and higher quality
                  outputs.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
