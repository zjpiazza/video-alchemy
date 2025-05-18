"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "~/contexts/auth-context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { History, Settings, CreditCard, Home, Video, LogOut, ChevronDown, User } from "lucide-react"

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const routes = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: Video,
      label: "New Transform",
      href: "/process",
      active: pathname === "/process",
    },
    {
      icon: History,
      label: "History",
      href: "/dashboard/history",
      active: pathname === "/dashboard/history",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
    {
      icon: CreditCard,
      label: "Billing",
      href: "/dashboard/billing",
      active: pathname === "/dashboard/billing",
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 px-2 py-3">
              <div className="rounded-full bg-primary/10 p-1">
                <svg
                  className="h-6 w-6 text-primary"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M35,35 L45,35 L60,85 Q60,95 40,95 Q20,95 20,85 L35,35"
                    className="fill-background stroke-primary"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M35,25 L45,25 L45,35 Q40,37 35,35 Z"
                    className="fill-background stroke-primary"
                    strokeWidth="4"
                  />
                  <path d="M36,15 L44,15 L44,20 Q40,22 36,20 Z" className="fill-primary" />
                  <path d="M38,20 L42,20 L42,25 Q40,27 38,25 Z" className="fill-primary/80" />
                  <path
                    d="M20,85 C20,85 25,60 40,60 C55,60 60,85 60,85 Q60,90 40,90 Q20,90 20,85 Z"
                    className="fill-primary/50"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold">VideoAlchemy</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={route.active}>
                    <Link href={route.href}>
                      <route.icon className="h-5 w-5" />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user?.name}</span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <span className="text-sm font-medium">{user?.email}</span>
              <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {user?.plan.charAt(0).toUpperCase() + user?.plan.slice(1)} Plan
              </div>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
