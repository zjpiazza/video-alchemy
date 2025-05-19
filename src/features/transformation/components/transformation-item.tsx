import { formatDistanceToNow } from "date-fns"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Download, ExternalLink, MoreVertical, Trash2, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { api } from "~/trpc/react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "~/components/ui/use-toast"

export interface TransformationItemProps {
  id: string
  name: string
  effect: string
  status: "completed" | "failed" | "processing"
  createdAt: Date
  duration: number
  fileSize: string
  thumbnailUrl: string
  outputUrl: string
  onDelete?: (id: string) => void // Add callback for external delete handling
}

export function TransformationItem({
  id,
  name,
  effect,
  status,
  createdAt,
  duration,
  fileSize,
  thumbnailUrl,
  outputUrl,
  onDelete,
}: TransformationItemProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false) // Track if this item has been deleted
  const utils = api.useUtils()
  const cardRef = useRef<HTMLDivElement>(null)

  // Delete mutation with optimistic updates
  const deleteMutation = api.transformation.delete.useMutation({
    onMutate: async (deleteInput) => {
      // Cancel any outgoing refetches
      await utils.transformation.list.cancel()
      await utils.transformation.search.cancel()
      
      // Track this item as deleted in component state
      setIsDeleted(true)
      
      // Get the cached data
      const previousListData = utils.transformation.list.getData({ limit: 100 })
      
      // Update list cache
      utils.transformation.list.setData(
        { limit: 100 },
        (old) => old ? old.filter(item => item.id !== deleteInput.id) : []
      )
      
      // Try to find and update any search queries in the cache
      const allQueries = utils.transformation.search.getInfiniteData()
      if (allQueries) {
        // This would be more complex for infinite queries, but helps handle active search queries
        // For simplicity, we're letting the invalidation handle this instead
      }

      // Let the parent component know this item is deleted
      if (onDelete) {
        onDelete(id)
      }
      
      // Animate the item away
      if (cardRef.current) {
        cardRef.current.style.transition = 'all 0.3s ease-out'
        cardRef.current.style.opacity = '0'
        cardRef.current.style.transform = 'scale(0.95)'
      }
      
      return { previousListData }
    },
    onError: (error, variables, context) => {
      // Revert deletion state
      setIsDeleted(false)
      
      // Revert animation
      if (cardRef.current) {
        cardRef.current.style.opacity = '1'
        cardRef.current.style.transform = 'scale(1)'
      }
      
      // Restore data if available
      if (context?.previousListData) {
        utils.transformation.list.setData({ limit: 100 }, context.previousListData)
      }
      
      toast({
        title: "Error deleting transformation",
        description: error.message,
        variant: "destructive",
      })
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      utils.transformation.list.invalidate()
      utils.transformation.search.invalidate()
    },
    onSuccess: () => {
      toast({
        title: "Transformation deleted",
        description: "The transformation has been deleted successfully.",
      })
    }
  })

  // If deleted, don't render the card at all after animation completes
  useEffect(() => {
    if (isDeleted && cardRef.current) {
      const timer = setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.display = 'none'
        }
      }, 300) // Match animation duration
      
      return () => clearTimeout(timer)
    }
  }, [isDeleted])

  // Handle download
  const handleDownload = () => {
    if (!outputUrl || status !== "completed") return

    // Create a temporary link to trigger download
    const a = document.createElement("a")
    a.href = outputUrl
    a.download = `${name.replace(/\s+/g, "_")}_transformed.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Download started",
      description: "Your transformed video is downloading.",
    })
  }

  // Handle delete
  const handleDelete = () => {
    deleteMutation.mutate({ id })
    setIsDeleteDialogOpen(false)
  }

  // Handle view
  const handleView = () => {
    if (!outputUrl || status !== "completed") return
    window.open(outputUrl, "_blank")
  }

  // Don't render if marked as deleted
  if (isDeleted && !cardRef.current) return null

  return (
    <Card ref={cardRef}>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          {thumbnailUrl ? (
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url(${thumbnailUrl})` }} 
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Preview</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">{name}</h3>
              <p className="text-xs text-white/80">{formatDistanceToNow(createdAt, { addSuffix: true })}</p>
            </div>
            <Badge
              variant={status === "completed" ? "default" : status === "processing" ? "outline" : "destructive"}
              className="capitalize"
            >
              {status}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{effect}</span>
          <span className="text-xs text-muted-foreground">
            {duration}s • {fileSize}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={status !== "completed"} 
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                disabled={status !== "completed"} 
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={status !== "completed"} 
                onClick={handleView}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onSelect={(e) => {
                      e.preventDefault()
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transformation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this transformation? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
} 