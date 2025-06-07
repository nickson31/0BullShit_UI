import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import ProjectSelectorSidebar from "@/components/project-selector-sidebar"
import NavigationSidebar from "@/components/navigation-sidebar"
import UserNav from "@/components/user-nav"
import { AppProvider } from '@/contexts/AppContext'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "0BullShit - AI Investor Matching Platform",
  description: "Find and connect with the right investors for your startup",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <div className="flex h-screen bg-background">
              <ProjectSelectorSidebar />
              <NavigationSidebar />
              <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-end p-4 h-16 border-b">
                  <UserNav />
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
                </div>
              </main>
            </div>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
