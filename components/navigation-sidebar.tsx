"use client"

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
  Plus,
  Menu,
  Settings,
  HelpCircle,
  ChevronsLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const bottomRoutes = [
  {
    label: "Help",
    icon: HelpCircle,
    href: "/help", // Placeholder href
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings", // Placeholder href
  },
]

const recentChats: Array<{ id: string; name: string }> = []

export default function NavigationSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const mainRoutes = useMemo(
    () => [
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

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-slate-50 dark:bg-slate-800 border-r dark:border-slate-700 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64", // Gemini-like width
        )}
      >
        <div className="p-3 border-b dark:border-slate-700 h-14 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              {/* <img src="/gemini-logo.svg" alt="0BullShit Logo" className="h-7 w-7" /> */}
              <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">0BullShit</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
          </Button>
        </div>

        <div className="p-2 mt-2">
          <Button
            variant="outline"
            className={cn(
              "w-full h-10 justify-start text-sm bg-white dark:bg-slate-700 dark:hover:bg-slate-600 hover:bg-slate-100 border-slate-300 dark:border-slate-600",
              isCollapsed && "justify-center aspect-square p-0",
            )}
            asChild
          >
            <Link href="/">
              <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && "New Chat"}
              {isCollapsed && <span className="sr-only">New Chat</span>}
            </Link>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-2 py-2">
          {isCollapsed && <div className="mb-2 border-t dark:border-slate-700 mx-2"></div>}
          {!isCollapsed && (
            <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent
            </h3>
          )}
          <nav className="space-y-1">
            {recentChats.length === 0 && !isCollapsed && (
              <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">No recent chats.</p>
            )}
            {recentChats.map((chat) => (
              <Tooltip key={chat.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname === `/chat/${chat.id}` ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-9 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                      isCollapsed && "justify-center aspect-square p-0",
                    )}
                    asChild
                  >
                    <Link href={`/chat/${chat.id}`}>
                      {" "}
                      {/* Placeholder href */}
                      <MessageSquare className={cn("h-4 w-4", !isCollapsed && "mr-2", isCollapsed && "m-auto")} />
                      {!isCollapsed && <span className="truncate">{chat.name}</span>}
                      {isCollapsed && <span className="sr-only">{chat.name}</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {!isCollapsed && (
                  <TooltipContent side="right" className="hidden">
                    {chat.name}
                  </TooltipContent>
                )}
                {isCollapsed && <TooltipContent side="right">{chat.name}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>

          {mainRoutes.length > 0 && (
            <>
              {isCollapsed && <div className="my-3 border-t dark:border-slate-700 mx-2"></div>}
              {!isCollapsed && (
                <h3 className="px-2 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tools
                </h3>
              )}
              <nav className="space-y-1">
                {mainRoutes.map((route) => (
                  <Tooltip key={route.label}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={pathname === route.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start h-9 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                          isCollapsed && "justify-center aspect-square p-0",
                        )}
                        asChild
                      >
                        <Link href={route.href}>
                          <route.icon className={cn("h-4 w-4", !isCollapsed && "mr-2", isCollapsed && "m-auto")} />
                          {!isCollapsed && route.label}
                          {isCollapsed && <span className="sr-only">{route.label}</span>}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {!isCollapsed && (
                      <TooltipContent side="right" className="hidden">
                        {route.label}
                      </TooltipContent>
                    )}
                    {isCollapsed && <TooltipContent side="right">{route.label}</TooltipContent>}
                  </Tooltip>
                ))}
              </nav>
            </>
          )}
        </ScrollArea>

        <div className="p-2 border-t dark:border-slate-700">
          <nav className="space-y-1">
            {bottomRoutes.map((route) => (
              <Tooltip key={route.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname === route.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start h-9 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
                      isCollapsed && "justify-center aspect-square p-0",
                    )}
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className={cn("h-4 w-4", !isCollapsed && "mr-2", isCollapsed && "m-auto")} />
                      {!isCollapsed && route.label}
                      {isCollapsed && <span className="sr-only">{route.label}</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {!isCollapsed && (
                  <TooltipContent side="right" className="hidden">
                    {route.label}
                  </TooltipContent>
                )}
                {isCollapsed && <TooltipContent side="right">{route.label}</TooltipContent>}
              </Tooltip>
            ))}
          </nav>
        </div>
      </aside>
    </TooltipProvider>
  )
}
