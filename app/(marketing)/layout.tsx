import type React from "react"
import { Header } from "@/components/header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="container mx-auto py-6 px-4">{children}</main>
    </>
  )
}
