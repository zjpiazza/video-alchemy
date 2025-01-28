import { VideoProcessor } from '@/components/video-processor'
import NoSSRWrapper from './NoSSRWrapper'
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Video Alchemy</h1>
          <p className="text-xl text-muted-foreground">
            Transform your videos with powerful effects - right in your browser
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <NoSSRWrapper>
            <VideoProcessor />
          </NoSSRWrapper>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by FFmpeg.wasm - All processing happens locally in your browser</p>
        </div>
      </div>
    </main>
  )
}