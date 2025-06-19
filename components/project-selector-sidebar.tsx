"use client"

import { Rocket, Plus, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useApp } from "@/contexts/AppContext"
import { useState } from "react"
import CreateProjectModal from "./create-project-modal" // Import the new modal

export default function ProjectSelectorSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false) // State for modal
  const { projects, currentProject, setCurrentProject, isLoadingProfile } = useApp()

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
              <span className="text-xl font-semibold text-slate-800 dark:text-slate-200 truncate">Projects</span>
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
            {isLoadingProfile &&
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-full h-10 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse",
                    !isExpanded && "aspect-square",
                  )}
                />
              ))}

            {!isLoadingProfile &&
              projects.map((project) => (
                <Tooltip key={project.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={project.id === currentProject?.id ? "secondary" : "ghost"}
                      onClick={() => setCurrentProject(project)}
                      className={cn(
                        "w-full h-10 rounded-md flex items-center",
                        isExpanded ? "justify-start px-3" : "justify-center p-0 aspect-square",
                        project.id === currentProject?.id
                          ? "bg-slate-200 dark:bg-slate-700 hover:bg-slate-200/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-100"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 hover:text-slate-800 dark:hover:text-slate-100",
                      )}
                    >
                      <div className={cn(isExpanded ? "mr-2" : "")}>
                        <Rocket className="h-5 w-5" />
                      </div>
                      {isExpanded && <span className="truncate text-sm font-medium">{project.name}</span>}
                      {!isExpanded && <span className="sr-only">{project.name}</span>}
                    </Button>
                  </TooltipTrigger>
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
                  onClick={() => setIsModalOpen(true)} // Open modal on click
                >
                  <Plus className={cn("h-5 w-5", isExpanded ? "mr-2" : "")} />
                  {isExpanded && <span className="text-sm font-medium">New Project</span>}
                  {!isExpanded && <span className="sr-only">New Project</span>}
                </Button>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">New Project</TooltipContent>}
            </Tooltip>
          </div>
        </ScrollArea>
        <div className={cn("mt-auto border-t p-2 dark:border-slate-700")} />
      </div>
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> {/* Render the modal */}
    </TooltipProvider>
  )
}
