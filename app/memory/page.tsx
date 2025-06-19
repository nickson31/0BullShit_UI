"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

import { BrainCircuit, Lightbulb, MessageSquareText, ListChecks, CalendarDays, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useApp } from "@/contexts/AppContext"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { api, type MemoryDashboardResponse } from "@/services/api"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Interaction {
  id: string
  query: string
  bot: string
  timestamp: string // ISO string
}
interface ActivityEvent {
  event: string
  date: string // ISO string
}

export default function MemoryPage() {
  const { currentProject, isLoadingProfile: isLoadingAppUser } = useApp()
  const { toast } = useToast()
  const [dashboardData, setDashboardData] = useState<MemoryDashboardResponse | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    const fetchMemoryData = async () => {
      if (currentProject?.id) {
        setIsLoadingData(true)
        try {
          const data = await api.getMemoryDashboard(currentProject.id) // Simulated API call
          setDashboardData(data)
        } catch (error) {
          toast({ title: "Error Fetching Memory Data", description: (error as Error).message, variant: "destructive" })
          setDashboardData(null)
        } finally {
          setIsLoadingData(false)
        }
      } else {
        setDashboardData(null) // Clear data if no project
      }
    }

    if (!isLoadingAppUser) {
      // Only fetch if user profile (and thus projects) has loaded
      fetchMemoryData()
    }
  }, [currentProject?.id, toast, isLoadingAppUser])

  const isLoading = isLoadingAppUser || isLoadingData

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <BrainCircuit className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Project Selected</h2>
        <p className="text-md text-slate-500 dark:text-slate-400 max-w-md text-center">
          Please select a project from the sidebar to view its Neural Memory dashboard.
        </p>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <BrainCircuit className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Memory Data Not Available</h2>
        <p className="text-md text-slate-500 dark:text-slate-400 max-w-md text-center">
          Could not load memory data for "{currentProject.name}". Try again later or contact support.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Neural Memory</h1>
          <p className="text-md text-muted-foreground">
            Project: <span className="font-semibold text-blue-600 dark:text-blue-400">{currentProject.name}</span>
          </p>
        </div>
        <Button
          onClick={() => toast({ title: "Manage Memory", description: "Memory management features coming soon." })}
        >
          <Zap className="mr-2 h-4 w-4" />
          Manage Memory Sources
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-blue-500" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={dashboardData.project_progress || 0} className="w-full h-3 mb-1" />
            <p className="text-2xl font-bold text-center">{dashboardData.project_progress || 0}%</p>
            <p className="text-xs text-muted-foreground text-center">
              Overall project completion estimate based on memory activity.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-green-500" />
              Recent Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.recent_interactions?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Interactions logged in the last 7 days.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Keywords Extracted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboardData.extracted_keywords?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Unique concepts identified by the AI.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-purple-500" />
              Activity Timeline
            </CardTitle>
            <CardDescription>Key events and interactions over time for this project.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.activity_timeline && dashboardData.activity_timeline.length > 0 ? (
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-4">
                  {dashboardData.activity_timeline.map((activity: ActivityEvent, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{activity.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No activity recorded yet for this project.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-teal-500" />
              Recommended Next Steps
            </CardTitle>
            <CardDescription>AI-suggested actions to move your project forward.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.recommended_steps && dashboardData.recommended_steps.length > 0 ? (
              <ul className="space-y-2.5">
                {dashboardData.recommended_steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Zap className="h-4 w-4 mt-0.5 text-teal-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-200">{step}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recommendations available at this time.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                toast({ title: "Generate New Recommendations", description: "This feature is coming soon." })
              }
            >
              Refresh Recommendations
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Extracted Keywords & Concepts
          </CardTitle>
          <CardDescription>Key terms and ideas identified from your project interactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.extracted_keywords && dashboardData.extracted_keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dashboardData.extracted_keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-2.5 py-1">
                  {keyword}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No keywords extracted yet. Interact more with the AI.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
