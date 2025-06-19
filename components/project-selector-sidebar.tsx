"use client"

import { Rocket, Plus, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/AppContext"
import { useState } from "react"
import CreateProjectModal from "./create-project-modal"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectSelectorSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { projects, currentProject, setCurrentProject, isLoadingProjects } = useApp()

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full border-r bg-slate-100 dark:bg-slate-800 transition-all duration-200 ease-in-out",
          isExpanded ? "w-60" : "w-16", // Slightly wider when expanded
        )}
      >
        <div className="flex h-14 items-center border-b px-3 dark:border-slate-700">
          {isExpanded && (
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate flex-grow">
              Projects
            </span>
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
            {isLoadingProjects &&
              [...Array(3)].map((_, i) => (
                <div key={i} className={cn("w-full h-10 rounded-md", !isExpanded && "aspect-square w-10 h-10")}>
                  <Skeleton className={cn("w-full h-full", !isExpanded && "rounded-md")} />
                </div>
              ))}

            {!isLoadingProjects &&
              projects.map((project) => (
                <Tooltip key={project.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={project.id === currentProject?.id ? "secondary" : "ghost"}
                      onClick={() => setCurrentProject(project)}
                      className={cn(
                        "w-full h-10 rounded-md flex items-center text-sm",
                        isExpanded ? "justify-start px-3" : "justify-center p-0 aspect-square",
                        project.id === currentProject?.id
                          ? "bg-blue-100 dark:bg-blue-700 hover:bg-blue-200/90 dark:hover:bg-blue-700/90 text-blue-700 dark:text-blue-100 font-medium"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-slate-100",
                      )}
                      title={project.name} // HTML title for truncated text
                    >
                      <Rocket className={cn("h-5 w-5 shrink-0", isExpanded ? "mr-2.5" : "")} />
                      {isExpanded && <span className="truncate">{project.name}</span>}
                      {!isExpanded && <span className="sr-only">{project.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {!isExpanded && <TooltipContent side="right">{project.name}</TooltipContent>}
                </Tooltip>
              ))}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-10 rounded-md flex items-center border-dashed border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-500 dark:hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
                    isExpanded ? "justify-start px-3" : "justify-center p-0 aspect-square",
                  )}
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className={cn("h-5 w-5 shrink-0", isExpanded ? "mr-2.5" : "")} />
                  {isExpanded && <span className="text-sm font-medium">New Project</span>}
                  {!isExpanded && <span className="sr-only">New Project</span>}
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">New Project</TooltipContent>}
            </Tooltip>
          </div>
        </ScrollArea>
        {/* Optional: Add a footer or separator if needed */}
        {/* <div className={cn("mt-auto border-t p-2 dark:border-slate-700")} /> */}
      </div>
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </TooltipProvider>
  )
}
