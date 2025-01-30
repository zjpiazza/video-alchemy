// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
// TODO: Fix this
import { tasks } from "npm:@trigger.dev/sdk@latest/v3";
// Import the videoProcessAndUpdate task from the trigger folder
import type { videoTransform } from "../../../trigger/transformVideo.js";




// Sets up a Deno server that listens for incoming JSON requests
// @ts-ignore
// TODO: Fix this
Deno.serve(async (req) => {
  const payload = await req.json();

  // Extract data from the new transformation record
  const { video_title, video_source_path, user_id, effect } = payload.record;

  // Trigger the video transform task
  // TODO: Why does this not throw if no deployment is found?
  await tasks.trigger<typeof videoTransform>("video-transform", {
    transformationId: payload.record.id,
    videoPath: video_source_path,
    transformations: { effect: effect } // Default effect, could be passed in payload
  });


  console.log('Triggered video transform for:', video_title);
  return new Response("ok");
});
