// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { tasks } from "npm:@trigger.dev/sdk@latest/v3";
// Import the videoProcessAndUpdate task from the trigger folder
import type { transformVideo } from "../../../trigger/transformVideo.js";
//     👆 type only import

// Sets up a Deno server that listens for incoming JSON requests
Deno.serve(async (req) => {
  const payload = await req.json();

  // Extract data from the new transformation record
  const { video_title, video_source_path, user_id, effect } = payload.record;

  // Trigger the video transform task
  // TODO: Why does this not throw if no deployment is found?
  await tasks.trigger<typeof transformVideo>("video-transform", {
    videoPath: video_source_path,
    userId: user_id,
    videoTitle: video_title,
    transformations: { effect: effect } // Default effect, could be passed in payload
  });

  console.log('Triggered video transform for:', video_title);
  return new Response("ok");
});
