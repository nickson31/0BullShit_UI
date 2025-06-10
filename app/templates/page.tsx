"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Template {
  id: string
  target_investor_id: string
  platform: string
  generated_template: string
  created_at: string
  target_name: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const projectId = "p1" // This should be dynamic in a real app

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.getProjectTemplates(projectId)
      setTemplates(response.templates)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [projectId, toast])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Message Templates</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        renderLoadingSkeletons()
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Message Templates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Get started by creating your first message template.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.target_name}</CardTitle>
                <CardDescription>Platform: {template.platform}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium">Generated Template</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.generated_template}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Edit</Button>
                <Button variant="destructive">Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
