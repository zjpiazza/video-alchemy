"use client";

import { TriggerAuthContext } from "@trigger.dev/react-hooks";

export function TriggerProvider({
  accessToken,
  children,
}: {
  accessToken: string;
  children: React.ReactNode;
}) {
  return (
    <TriggerAuthContext.Provider
      value={{
        baseURL: process.env.NEXT_PUBLIC_TRIGGER_API_URL,
        accessToken,
      }}
    >
      {children}
    </TriggerAuthContext.Provider>
  );
}