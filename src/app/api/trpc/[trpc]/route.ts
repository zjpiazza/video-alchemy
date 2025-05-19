import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { env } from "process";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import SuperJSON from "superjson";


const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
