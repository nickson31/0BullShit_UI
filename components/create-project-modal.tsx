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
import { Textarea } from "@/components/ui/textarea" // Added Textarea
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
// No direct api call here, useApp's createProject handles it
import { useApp } from "@/contexts/AppContext"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("") // Added state for description
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { createProject } = useApp() // Use createProject from context

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
      const newProject = await createProject(projectName.trim(), projectDescription.trim())
      if (newProject) {
        toast({
          title: "Project created successfully!",
          description: `"${newProject.name}" is now active.`,
        })
        setProjectName("")
        setProjectDescription("")
        onClose()
      } else {
        toast({
          title: "Failed to create project",
          description: "Could not create the project. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Should be caught by createProject in context, but good to have a fallback
      console.error("Failed to create project (modal level):", error)
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Reset form on close if not loading
          if (!isLoading) {
            setProjectName("")
            setProjectDescription("")
          }
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your new project a name and an optional description. This will help you organize your work.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="col-span-3"
              placeholder="E.g., My Awesome Startup"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            {" "}
            {/* items-start for textarea label */}
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="col-span-3 min-h-[80px]"
              placeholder="Optional: Briefly describe your project's goals or focus."
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (!isLoading) {
                // Prevent closing if loading
                setProjectName("")
                setProjectDescription("")
                onClose()
              }
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateProject} disabled={isLoading || projectName.trim() === ""}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
