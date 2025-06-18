import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ProjectSelectorSidebar from "@/components/project-selector-sidebar"
import NavigationSidebar from "@/components/navigation-sidebar"
import UserNav from "@/components/user-nav"
import { AppProvider } from "@/contexts/AppContext"
import { AuthProvider } from "@/components/auth-provider"
import { GoogleOAuthProvider } from "@react-oauth/google" // Added import
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "0BullShit - AI Investor Matching Platform",
  description: "Find and connect with the right investors for your startup",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure NEXT_PUBLIC_GOOGLE_CLIENT_ID is defined in your environment variables.
  // It's crucial that this is always provided to GoogleOAuthProvider,
  // even if it's an empty string, as the provider must always be mounted.
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-950`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {/* GoogleOAuthProvider must always be rendered, even if clientId is empty.
              The library handles the case of a missing ID gracefully. */}
          <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
              <AppProvider>
                <div className="flex h-screen">
                  <ProjectSelectorSidebar />
                  <NavigationSidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex items-center justify-end p-3 h-14 border-b bg-white dark:bg-slate-900 dark:border-slate-700">
                      <UserNav />
                    </header>
                    <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">{children}</main>
                  </div>
                </div>
              </AppProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
          {/* Add a warning script for development if the client ID is missing */}
          {process.env.NODE_ENV !== "production" && !googleClientId && (
            <script
              dangerouslySetInnerHTML={{
                __html: `console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not function.");`,
              }}
            />
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
