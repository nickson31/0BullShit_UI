"use client"

import { useState } from "react"
import { Plus, ChevronsLeft, ChevronsRight } from "lucide-react" // Removed Settings
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

const projects: Array<{ id: string; name: string; icon: JSX.Element; href: string }> = []

// Placeholder for the current active project ID - will be dynamic with auth
const currentProjectId: string | null = null

export default function ProjectSelectorSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full border-r bg-slate-100 dark:bg-slate-800 transition-all duration-200 ease-in-out",
          isExpanded ? "w-56" : "w-16",
        )}
      >
        <div className="flex h-14 items-center border-b px-3 dark:border-slate-700">
          {isExpanded && (
            <Link href="/" className="flex items-center gap-2 flex-grow min-w-0">
              <span className="text-xl font-semibold text-slate-800 dark:text-slate-200 truncate">0BullShit</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "h-8 w-8 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700",
              isExpanded ? "ml-auto" : "mx-auto",
            )}
            aria-label={isExpanded ? "Collapse project sidebar" : "Expand project sidebar"}
          >
            {isExpanded ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <div className={cn("space-y-1.5", isExpanded ? "p-2" : "p-2 flex flex-col items-center")}>
            {projects.length === 0 && isExpanded && (
              <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No projects found.</p>
            )}
            {projects.length === 0 && !isExpanded && (
              <div className="p-2">
                {/* Optionally show a placeholder icon or nothing when collapsed and no projects */}
              </div>
            )}
            {projects.map((project) => (
              <Tooltip key={project.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={project.id === currentProjectId ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-10 rounded-md flex items-center",
                      isExpanded ? "justify-start px-3" : "justify-center p-0 aspect-square",
                      project.id === currentProjectId
                        ? "bg-slate-200 dark:bg-slate-700 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-slate-100",
                    )}
                    asChild
                  >
                    <Link href={project.href}>
                      <div className={cn(isExpanded ? "mr-2" : "")}>{project.icon}</div>
                      {isExpanded && <span className="truncate text-sm font-medium">{project.name}</span>}
                      {!isExpanded && <span className="sr-only">{project.name}</span>}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isExpanded && (
                  <TooltipContent side="right" className="hidden">
                    {project.name}
                  </TooltipContent>
                )}
                {!isExpanded && <TooltipContent side="right">{project.name}</TooltipContent>}
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full h-10 rounded-md flex items-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-slate-100",
                    isExpanded ? "justify-start px-3" : "justify-center p-0 aspect-square",
                  )}
                >
                  <Plus className={cn("h-5 w-5", isExpanded ? "mr-2" : "")} />
                  {isExpanded && <span className="text-sm font-medium">New Project</span>}
                  {!isExpanded && <span className="sr-only">New Project</span>}
                </Button>
              </TooltipTrigger>
              {isExpanded && (
                <TooltipContent side="right" className="hidden">
                  New Project
                </TooltipContent>
              )}
              {!isExpanded && <TooltipContent side="right">New Project</TooltipContent>}
            </Tooltip>
          </div>
        </ScrollArea>

        {/* Settings button section removed from here */}
        <div className={cn("mt-auto border-t p-2 dark:border-slate-700", !isExpanded && "flex flex-col items-center")}>
          {/* This div is kept for consistent bottom padding/border, but content is removed */}
        </div>
      </div>
    </TooltipProvider>
  )
}
