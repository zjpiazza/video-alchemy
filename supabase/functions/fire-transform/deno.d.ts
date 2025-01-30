declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module "@supabase/supabase-js" {
  export * from '@supabase/supabase-js';
} 