"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  plan: "free" | "pro" | "enterprise"
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Safely check localStorage only on client-side
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedAuth = localStorage.getItem("videoalchemy-auth")

        if (savedAuth === "true") {
          // Mock user data
          setUser({
            id: "user-1",
            name: "Demo User",
            email: "demo@example.com",
            plan: "pro",
            avatar: "/diverse-avatars.png",
          })
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = () => {
    try {
      // Mock login
      setUser({
        id: "user-1",
        name: "Demo User",
        email: "demo@example.com",
        plan: "pro",
        avatar: "/diverse-avatars.png",
      })
      localStorage.setItem("videoalchemy-auth", "true")
    } catch (error) {
      console.error("Error during login:", error)
    }
  }

  const logout = () => {
    try {
      setUser(null)
      localStorage.removeItem("videoalchemy-auth")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
