"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/services/api"
import { useApp } from "@/contexts/AppContext"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { fetchProfileAndProjects, setCurrentProject } = useApp()

  const handleCreateProject = async () => {
    if (projectName.trim() === "") {
      toast({
        title: "Project name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const newProject = await api.createProject({ name: projectName })
      toast({
        title: "Project created successfully!",
        description: `"${newProject.name}" is now active.`,
      })
      await fetchProfileAndProjects() // Refresh projects list
      setCurrentProject(newProject) // Set the new project as current
      setProjectName("") // Clear input
      onClose() // Close modal
    } catch (error) {
      console.error("Failed to create project:", error)
      toast({
        title: "Failed to create project",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your new project a name. This will help you organize your investor searches.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateProject} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
