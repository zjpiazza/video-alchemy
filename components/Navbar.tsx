import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Your other navbar items */}
        <ThemeToggle />
      </div>
    </nav>
  )
} 