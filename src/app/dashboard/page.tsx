"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "~/contexts/auth-context"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { TransformationHistoryItem } from "~/components/transformation-history-item"
import { ArrowRight, Clock, Video, Zap } from "lucide-react"

// Mock data for recent transformations
const recentTransformations = [
  {
    id: "transform-1",
    name: "Promotional Video",
    effect: "Resize",
    status: "completed" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    duration: 45,
    fileSize: "12.4 MB",
    thumbnailUrl: "/video-thumbnail.png",
    outputUrl: "#",
  },
  {
    id: "transform-2",
    name: "Product Demo",
    effect: "Compress",
    status: "processing" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    duration: 120,
    fileSize: "34.8 MB",
    thumbnailUrl: "/video-thumbnail.png",
    outputUrl: "#",
  },
  {
    id: "transform-3",
    name: "Tutorial Video",
    effect: "Trim",
    status: "completed" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    duration: 180,
    fileSize: "45.2 MB",
    thumbnailUrl: "/video-thumbnail.png",
    outputUrl: "#",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock usage stats
  const usageStats = {
    transformationsThisMonth: 24,
    transformationsLimit: 50,
    storageUsed: "1.2 GB",
    storageLimit: "5 GB",
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/process">
            New Transformation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Transformations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Transformations</CardTitle>
                <CardDescription>Usage this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats.transformationsThisMonth} / {usageStats.transformationsLimit}
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${(usageStats.transformationsThisMonth / usageStats.transformationsLimit) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Storage</CardTitle>
                <CardDescription>Total storage used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats.storageUsed} / {usageStats.storageLimit}
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${(Number.parseInt(usageStats.storageUsed) / Number.parseInt(usageStats.storageLimit)) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <CardDescription>Your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{user?.plan}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {user?.plan === "free"
                    ? "Limited to client-side processing"
                    : "Full access to server-side processing"}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/dashboard/billing">Manage Subscription</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Transformations</CardTitle>
                <CardDescription>Your latest video transformations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentTransformations.slice(0, 3).map((transform) => (
                    <TransformationHistoryItem key={transform.id} {...transform} />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("recent")}>
                  View All Transformations
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/process">
                    <Video className="mr-2 h-4 w-4" />
                    New Transformation
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/history">
                    <Clock className="mr-2 h-4 w-4" />
                    View History
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/billing">
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>All Transformations</CardTitle>
              <CardDescription>Your complete transformation history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentTransformations.map((transform) => (
                  <TransformationHistoryItem key={transform.id} {...transform} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
