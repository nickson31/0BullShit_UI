"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  FileText,
  BrainCircuit,
  Send,
  Coins,
  Users,
  Plus,
  Menu,
  Settings,
  HelpCircle,
  ChevronsLeft,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useApp } from "@/contexts/AppContext" // To get project name for recent chats (optional)

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  disabled?: boolean // For features not yet fully implemented
}

// Mock recent chats - in a real app, this would come from user history or context
const mockRecentChats: Array<{ id: string; name: string; projectId?: string }> = [
  // { id: "chat1", name: "Fintech Investor Search", projectId: "p1" },
  // { id: "chat2", name: "AI Startup Analysis", projectId: "p2" },
]

export default function NavigationSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { currentProject } = useApp() // Get current project for context

  const mainRoutes = useMemo<NavItem[]>(
    () => [
      {
        label: "Chat", // Main chat interface
        icon: Home,
        href: "/",
      },
      {
        label: "Documents",
        icon: FileText,
        href: "/documents",
      },
      {
        label: "Memory",
        icon: BrainCircuit,
        href: "/memory",
      },
      {
        label: "Investors", // New Investors route
        icon: Users,
        href: "/investors",
      },
      {
        label: "Outreach",
        icon: Send,
        href: "/outreach",
      },
      {
        label: "Credits & Plan",
        icon: Coins,
        href: "/credits",
      },
    ],
    [],
  )

  const bottomRoutes: NavItem[] = [
    {
      label: "Help",
      icon: HelpCircle,
      href: "/help",
      disabled: true, // Example of disabling a route
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      disabled: true, // Example
    },
  ]

  const NavLink = ({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-10 text-sm",
            isCollapsed && "justify-center aspect-square p-0",
            item.disabled && "opacity-50 cursor-not-allowed",
            pathname === item.href
              ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 font-medium"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70",
          )}
          asChild={!item.disabled}
          disabled={item.disabled}
          aria-disabled={item.disabled}
        >
          {item.disabled ? (
            <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "")}>
              <item.icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.label}
              {isCollapsed && <span className="sr-only">{item.label}</span>}
            </div>
          ) : (
            <Link href={item.href} prefetch={false}>
              <item.icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.label}
              {isCollapsed && <span className="sr-only">{item.label}</span>}
            </Link>
          )}
        </Button>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          {item.label}
          {item.disabled ? " (Coming Soon)" : ""}
        </TooltipContent>
      )}
    </Tooltip>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="p-3 border-b dark:border-slate-700 h-14 flex items-center justify-between shrink-0">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 overflow-hidden">
              {/* Replace with actual logo if available */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-blue-600 dark:text-blue-400">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
              </svg>
              <span className="font-semibold text-lg text-slate-800 dark:text-slate-200 truncate">0BullShit</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 shrink-0"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>

        <div className="p-2 mt-2 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-10 justify-start text-sm bg-white dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-slate-100 border-slate-300 dark:border-slate-600",
                  isCollapsed && "justify-center aspect-square p-0",
                )}
                asChild
              >
                <Link href="/">
                  {" "}
                  {/* Default to new chat on main page */}
                  <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && "New Chat"}
                  {isCollapsed && <span className="sr-only">New Chat</span>}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">New Chat</TooltipContent>}
          </Tooltip>
        </div>

        <ScrollArea className="flex-1 px-2 py-2">
          {mockRecentChats.length > 0 && (
            <>
              {isCollapsed && <div className="mb-2 border-t dark:border-slate-700 mx-2"></div>}
              {!isCollapsed && (
                <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Recent
                </h3>
              )}
              <nav className="space-y-1">
                {mockRecentChats.map((chat) => (
                  <Tooltip key={chat.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={pathname === `/chat/${chat.id}` ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-9 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                          isCollapsed && "justify-center aspect-square p-0",
                          pathname === `/chat/${chat.id}` && "bg-slate-200 dark:bg-slate-700",
                        )}
                        asChild
                      >
                        <Link href={`/chat/${chat.id}`} prefetch={false}>
                          <MessageSquare
                            className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2", isCollapsed && "m-auto")}
                          />
                          {!isCollapsed && <span className="truncate">{chat.name}</span>}
                          {isCollapsed && <span className="sr-only">{chat.name}</span>}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{chat.name}</TooltipContent>}
                  </Tooltip>
                ))}
              </nav>
            </>
          )}

          {mainRoutes.length > 0 && (
            <>
              {isCollapsed && mockRecentChats.length > 0 && (
                <div className="my-3 border-t dark:border-slate-700 mx-2"></div>
              )}
              {!isCollapsed && (
                <h3 className="px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tools
                </h3>
              )}
              <nav className="space-y-1">
                {mainRoutes.map((route) => (
                  <NavLink key={route.label} item={route} isCollapsed={isCollapsed} />
                ))}
              </nav>
            </>
          )}
        </ScrollArea>

        <div className="p-2 border-t dark:border-slate-700 shrink-0">
          <nav className="space-y-1">
            {bottomRoutes.map((route) => (
              <NavLink key={route.label} item={route} isCollapsed={isCollapsed} />
            ))}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  )
}
