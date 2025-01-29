import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProcessingStats {
  progress: number
  fps: number
  time: string
  bitrate: string
  speed: string
}

interface ProcessingStatsProps {
  stats: ProcessingStats
}

export function ProcessingStats({ stats }: ProcessingStatsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress value={stats.progress} />
        <p className="text-sm text-center text-muted-foreground">
          Processing: {stats.progress}%
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">FPS</p>
          <p className="text-lg font-medium">{stats.fps.toFixed(1)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Time</p>
          <p className="text-lg font-medium">{stats.time}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Bitrate</p>
          <p className="text-lg font-medium">{stats.bitrate}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Speed</p>
          <p className="text-lg font-medium">{stats.speed}x</p>
        </Card>
      </div>
    </div>
  )
} 