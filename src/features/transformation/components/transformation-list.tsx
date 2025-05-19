"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Search, Filter, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { TransformationItem, TransformationItemProps } from "~/features/transformation/components/transformation-item"
import { api } from "~/trpc/react"
import type { Transformation } from "@prisma/client"

export default function Transformations() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const utils = api.useUtils()
  
  // Debounce search query to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Use search query for tRPC if not empty, otherwise use list query
  const listQuery = api.transformation.list.useQuery({
    limit: 100,
  }, {
    enabled: !debouncedQuery
  });
  
  const searchResults = api.transformation.search.useQuery({
    query: debouncedQuery,
    limit: 100,
  }, {
    enabled: !!debouncedQuery
  });

  // Determine which query to use based on search state
  const isLoading = debouncedQuery ? searchResults.isLoading : listQuery.isLoading;
  const transformations: Transformation[] = debouncedQuery 
    ? (searchResults.data || []) 
    : (listQuery.data || []);

  // Map database model to component props
  const mappedTransformations: TransformationItemProps[] = transformations.map(t => ({
    id: t.id,
    name: t.name,
    effect: t.effectId, // This should ideally be the effect name, not ID
    status: mapStatus(t.status),
    createdAt: t.createdAt,
    duration: t.duration || 0,
    fileSize: formatFileSize(t.fileSize || 0),
    thumbnailUrl: t.thumbnailUrl || '/placeholder-thumbnail.jpg',
    outputUrl: t.outputUrl || '',
  }));

  // Add state to track deleted items
  const [deletedItems, setDeletedItems] = useState<Record<string, boolean>>({})

  // Handler for when an item is deleted 
  const handleItemDeleted = (id: string) => {
    setDeletedItems(prev => ({ ...prev, [id]: true }))
  }

  // Filter out items that are marked as deleted
  const filteredMappedTransformations = mappedTransformations.filter(
    item => !deletedItems[item.id]
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transformation History</h1>
        <Button 
          variant="outline" 
          onClick={() => {
            utils.transformation.list.invalidate();
            utils.transformation.search.invalidate();
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Add error handling for the queries */}
      {(listQuery.error || searchResults.error) && (
        <div className="bg-destructive/10 text-destructive rounded-md p-4 my-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>Error loading transformations: {listQuery.error?.message || searchResults.error?.message}</p>
        </div>
      )}

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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading transformations...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredMappedTransformations.map((transform) => (
                  <TransformationItem 
                    key={transform.id} 
                    {...transform} 
                    onDelete={handleItemDeleted}
                  />
                ))}
              </div>

              {filteredMappedTransformations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No transformations found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {debouncedQuery 
                      ? "We couldn't find any transformations matching your search."
                      : "You haven't created any transformations yet."}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function mapStatus(status: string): "completed" | "failed" | "processing" {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "failed";
    case "PROCESSING":
    case "PENDING":
    default:
      return "processing";
  }
}
