import { auth } from "@trigger.dev/sdk/v3";

export async function generatePublicAccessToken(runId: string) {
  return auth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });
}