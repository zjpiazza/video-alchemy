"use client"

import { useState } from "react"
import Link from "next/link"
import React from "react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
// import { TransformationHistoryItem } from "~/components/transformation-history-item"
import { ArrowRight, Clock, Video, Zap } from "lucide-react"
import { useUser } from '@clerk/nextjs'
import { api } from '~/trpc/react'


export default function Dashboard() {
  const { user, isLoaded: userLoaded } = useUser()

  // Get user's plan from metadata
  const userPlan = user?.publicMetadata?.plan as string || 'free'

  // Only fetch quota when user is fully loaded and has an ID
  const [hasFetched, setHasFetched] = useState(false)
  const userId = user?.id || ''

  // Don't even attempt to fetch if no user is loaded
  const { data: quota, isLoading: quotaLoading } = api.quota.getForUser.useQuery(
    { clerkUserId: userId },
    {
      enabled: !!userId && userLoaded,
      retry: 1
    }
  )
  const { data: recentTransformations, isLoading: recentTransformationsLoading } = api.transformation.list.useQuery(
    { limit: 3 },
    {
      enabled: !!userId && userLoaded,
      retry: 1
    }
  )

  // Set hasFetched when data is loaded
  React.useEffect(() => {
    if (quota) {
      setHasFetched(true);
    }
  }, [quota]);

  // Loading states
  if (!userLoaded) return <div>Loading user...</div>
  if (!user) return <div>Please sign in to view your dashboard.</div>

  // Only show loading for the first fetch
  if (quotaLoading && !hasFetched) return <div>Loading usage stats...</div>
  if (!quota) return <div>No quota found. Please refresh the page.</div>

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


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transformations</CardTitle>
            <CardDescription>Usage this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quota.usedTransformations} / {quota.totalTransformations}
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${(quota.usedTransformations / quota.totalTransformations) * 100}%`,
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
              {quota.usedStorageGb} GB / {quota.totalStorageGb} GB
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${(quota.usedStorageGb / quota.totalStorageGb) * 100}%`,
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
            <div className="text-2xl font-bold capitalize">{userPlan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {userPlan === "free"
                ? "Limited to client-side processing"
                : "Full access to server-side processing"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transformations</CardTitle>
            <CardDescription>Your latest video transformations</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentTransformations?.slice(0, 3).map((transform) => (
                <TransformationHistoryItem
                  key={transform.id}
                  {...transform}
                  effect={transform.effectId ?? "Unknown"}
                  status={
                    transform.status === "PENDING"
                      ? "processing"
                      : transform.status === "COMPLETED"
                      ? "completed"
                      : transform.status === "FAILED"
                      ? "failed"
                      : "processing"
                  }
                  duration={transform.duration ?? 0}
                />
              ))}
            </div> */}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/history">
                View All Transformations
              </Link>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
