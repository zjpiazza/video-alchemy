import { SignedIn, SignedOut } from "@clerk/nextjs";
import Landing from "~/components/landing/view";
import Dashboard from "~/components/dashboard/view";
import { DashboardSidebar } from "~/components/dashboard/sidebar";
export default function Home() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <Landing />
      </SignedOut>
    </>
  );
}