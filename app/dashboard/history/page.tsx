"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TransformationHistoryItem } from "@/components/transformation-history-item"
import { Search, Filter } from "lucide-react"

// Mock data for transformations
const transformations = [
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
  {
    id: "transform-4",
    name: "Marketing Video",
    effect: "Grayscale",
    status: "completed" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    duration: 60,
    fileSize: "22.1 MB",
    thumbnailUrl: "/video-thumbnail.png",
    outputUrl: "#",
  },
  {
    id: "transform-5",
    name: "Social Media Clip",
    effect: "Rotate",
    status: "failed" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    duration: 15,
    fileSize: "8.7 MB",
    thumbnailUrl: "/video-thumbnail.png",
    outputUrl: "#",
  },
  {
    id: "transform-6",
    name: "Webinar Recording",
    effect: "Convert Format",
    status: "completed" as const,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    duration: 3600,
    fileSize: "1.2 GB",
    thumbnailUrl: "/video-thumbnail.png",
    outputUrl: "#",
  },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTransformations = transformations.filter((transform) =>
    transform.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transformation History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transformations</CardTitle>
          <CardDescription>View and manage your video transformations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transformations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTransformations.map((transform) => (
              <TransformationHistoryItem key={transform.id} {...transform} />
            ))}
          </div>

          {filteredTransformations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No transformations found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We couldn't find any transformations matching your search.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
