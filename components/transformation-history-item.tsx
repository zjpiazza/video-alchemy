import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Download, ExternalLink, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface TransformationHistoryItemProps {
  id: string
  name: string
  effect: string
  status: "completed" | "failed" | "processing"
  createdAt: Date
  duration: number
  fileSize: string
  thumbnailUrl: string
  outputUrl: string
}

export function TransformationHistoryItem({
  id,
  name,
  effect,
  status,
  createdAt,
  duration,
  fileSize,
  thumbnailUrl,
  outputUrl,
}: TransformationHistoryItemProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${thumbnailUrl})` }} />
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
          <Button variant="ghost" size="icon" disabled={status !== "completed"}>
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
              <DropdownMenuItem disabled={status !== "completed"}>
                <Download className="mr-2 h-4 w-4" />
                <span>Download</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={status !== "completed"}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}
