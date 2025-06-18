import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ProjectSelectorSidebar from "@/components/project-selector-sidebar"
import NavigationSidebar from "@/components/navigation-sidebar"
import UserNav from "@/components/user-nav"
import { AppProvider } from "@/contexts/AppContext"
import { AuthProvider } from "@/components/auth-provider" // Added import
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-950`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
