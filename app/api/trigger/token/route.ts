import { generatePublicAccessToken } from "@/lib/trigger"

export async function POST(request: Request) {
  const { transformationId } = await request.json()
  
  try {
    const token = await generatePublicAccessToken(transformationId.toString())
    
    return Response.json({ token })
  } catch (error) {
    console.error('Error generating token:', error)
    return Response.json({ error: 'Failed to generate token' }, { status: 500 })
  }
} 