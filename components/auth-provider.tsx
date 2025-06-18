"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

// Define routes that do not require authentication and should always render
const publicRoutes = ["/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start as true to indicate initial auth check
  const pathname = usePathname()
  const router = useRouter()

  // Effect to check authentication status and set loading state
  useEffect(() => {
    // If the current route is a public route, we don't need to perform auth checks
    // or block rendering with a loading spinner.
    if (publicRoutes.includes(pathname)) {
      setIsLoading(false) // Ensure loading state is false for public routes
      return
    }

    // For protected routes, check for an auth token
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setIsLoading(false) // Authentication check is complete
  }, [pathname]) // Re-run this effect when the URL path changes

  // Effect to handle redirection based on authentication status
  useEffect(() => {
    // Only attempt to redirect if the initial loading check is complete
    // and the current path is not a public route.
    if (!isLoading && !publicRoutes.includes(pathname)) {
      if (!isAuthenticated) {
        // If not authenticated, redirect to the login page
        router.push("/login")
      }
      // No need for an else if (isAuthenticated && pathname === "/login") here,
      // as publicRoutes.includes(pathname) already handles the /login case.
      // If a user somehow lands on /login while authenticated, AppContext will redirect them to /
    }
  }, [isLoading, isAuthenticated, pathname, router])

  // Render logic:
  // 1. If we are still loading AND the current route is NOT a public route, show a spinner.
  //    This prevents showing content before auth status is determined for protected pages.
  if (isLoading && !publicRoutes.includes(pathname)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // 2. Otherwise (either loading is complete, or it's a public route), render the children.
  return <>{children}</>
}
