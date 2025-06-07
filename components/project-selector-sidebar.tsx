import { useState } from "react"
import { Plus, Settings, FolderGit2, BotMessageSquare, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const projects = [
  { id: "p1", name: "HeartIO", icon: <FolderGit2 className="h-5 w-5 text-slate-700" /> },
  { id: "p2", name: "Soleolico", icon: <BotMessageSquare className="h-5 w-5 text-slate-700" /> },
  { id: "p3", name: "Project Gamma", icon: <UserCircle className="h-5 w-5 text-slate-700" /> },
]

export function ProjectSelectorSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300",
          isExpanded ? "w-60" : "w-16"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex h-16 items-center justify-center border-b">
          {isExpanded ? (
            <h2 className="text-lg font-semibold">Projects</h2>
          ) : (
            <span className="text-2xl">📁</span>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {projects.map((project, index) => (
              <Tooltip key={project.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={index === 0 ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full",
                      index === 0 ? "bg-slate-300 hover:bg-slate-300/90" : "hover:bg-slate-200",
                      !isExpanded && "justify-center"
                    )}
                  >
                    {project.icon}
                    <span className="sr-only">{project.name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{project.name}</TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full hover:bg-slate-200",
                    !isExpanded && "justify-center"
                  )}
                >
                  <Plus className="h-5 w-5 text-slate-700" />
                  <span className="sr-only">New Project</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Project</TooltipContent>
            </Tooltip>
          </div>
        </ScrollArea>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-200">
              <Settings className="h-5 w-5 text-slate-700" />
              <span className="sr-only">Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
