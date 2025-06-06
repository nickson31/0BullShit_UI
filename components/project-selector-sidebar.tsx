import { Plus, Settings, FolderGit2, BotMessageSquare, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const projects = [
  { id: "p1", name: "HeartIO", icon: <FolderGit2 className="h-5 w-5 text-slate-700" /> },
  { id: "p2", name: "Soleolico", icon: <BotMessageSquare className="h-5 w-5 text-slate-700" /> },
  { id: "p3", name: "Project Gamma", icon: <UserCircle className="h-5 w-5 text-slate-700" /> },
]

export default function ProjectSelectorSidebar() {
  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex flex-col items-center w-16 h-full bg-slate-100 py-4 space-y-4 border-r border-slate-200">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-200">
              <Plus className="h-5 w-5 text-slate-700" />
              <span className="sr-only">New Project</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New Project</TooltipContent>
        </Tooltip>

        <div className="flex-1 flex flex-col items-center space-y-3 pt-4">
          {projects.map((project, index) => (
            <Tooltip key={project.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={index === 0 ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-10 w-10 rounded-full ${index === 0 ? "bg-slate-300 hover:bg-slate-300/90" : "hover:bg-slate-200"}`}
                >
                  {project.icon}
                  <span className="sr-only">{project.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{project.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-200">
              <Settings className="h-5 w-5 text-slate-700" />
              <span className="sr-only">Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}
