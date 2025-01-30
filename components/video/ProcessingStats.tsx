import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProcessingMetrics {
  type: 'client' | 'server'
  progress: number
  time: string
  fps?: number
  speed?: number
  frames?: number
  size?: number
}

interface ProcessingStatsProps {
  stats: ProcessingMetrics
}

export function ProcessingStats({ stats }: ProcessingStatsProps) {
  if (stats.type === 'client') {
    return (
      <div className="space-y-2">
        <Progress value={stats.progress} />
        <p className="text-sm text-center text-muted-foreground">
          {stats.progress}% Complete
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress value={stats.progress} />
        <p className="text-sm text-center text-muted-foreground">
          {stats.progress}% Complete
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Time</p>
          <p className="text-lg font-medium">{stats.time}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">FPS</p>
          <p className="text-lg font-medium">{stats.fps?.toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Speed</p>
          <p className="text-lg font-medium">{stats.speed?.toFixed(1)}x</p>
        </div>
      </div>
    </div>
  )
} 