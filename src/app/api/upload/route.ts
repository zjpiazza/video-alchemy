import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // TODO: Authenticate and authorize users before generating the token.
        return {
          allowedContentTypes: [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/mov',
            'video/avi',
            'video/x-matroska',
          ],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}), // Optionally pass user info or other data
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optionally handle post-upload logic here
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
} 