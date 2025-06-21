"use client"

import { useState, useEffect } from "react"
import { useApp } from "../contexts/AppContext" // Changed from "@/contexts/AppContext"
import { useToast } from "../components/ui/use-toast" // Changed from "@/components/ui/use-toast"
import ChatInterface from "../components/chat-interface"
// import RecentChatsList from "../components/recent-chats-list"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card" // Changed from "@/components/ui/card"
import { Skeleton } from "../components/ui/skeleton" // Changed from "@/components/ui/skeleton"
import { Lightbulb, TrendingUp } from "lucide-react"
import { api, type MemoryDashboardResponse } from "../services/api" // Changed from "@/services/api"
import { Progress } from "../components/ui/progress" // Changed from "@/components/ui/progress"

export default function DashboardPage() {
  const { currentProject, isLoadingProfile, profile } = useApp()
  const { toast } = useToast()
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null)
  const [memoryDashboardData, setMemoryDashboardData] = useState<MemoryDashboardResponse | null>(null)
  const [isLoadingMemory, setIsLoadingMemory] = useState(true)

  useEffect(() => {
    const fetchMemoryData = async () => {
      if (!currentProject) {
        setMemoryDashboardData(null)
        setIsLoadingMemory(false)
        return
      }
      setIsLoadingMemory(true)
      try {
        const data = await api.getMemoryDashboard(currentProject.id)
        setMemoryDashboardData(data)
      } catch (error) {
        toast({
          title: "Error Fetching Memory Dashboard",
          description: (error as Error).message,
          variant: "destructive",
        })
        setMemoryDashboardData(null)
      } finally {
        setIsLoadingMemory(false)
      }
    }

    if (!isLoadingProfile && currentProject) {
      fetchMemoryData()
    } else if (!isLoadingProfile && !currentProject) {
      setMemoryDashboardData(null)
      setIsLoadingMemory(false)
    }
  }, [currentProject, isLoadingProfile, toast])

  const handleNewChatStarted = (sessionId: string) => {
    setActiveChatSessionId(sessionId)
    // Optionally, trigger a refetch of recent chats in RecentChatsList
    // This would require passing a refetch function down or using a global state/context for recent chats
  }

  const handleChatLoaded = (sessionId: string) => {
    setActiveChatSessionId(sessionId)
  }

  return (
    <div className="container py-6 h-full flex flex-col lg:flex-row gap-6">
      {/* Left Column */}
      <div className="lg:w-1/3 flex flex-col space-y-6">
        {/* Memory Dashboard Section */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-slate-500" />
              Neural Memory & Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMemory ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full mt-4" />
              </div>
            ) : memoryDashboardData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Insights:</h3>
                  <p className="text-sm text-muted-foreground">{memoryDashboardData.neural_memory_insights}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Project Progress:</h3>
                  <div className="flex items-center gap-2">
                    <Progress value={memoryDashboardData.project_progress_percentage} className="w-full" />
                    <span className="text-sm font-medium">{memoryDashboardData.project_progress_percentage}%</span>
                  </div>
                </div>
                {memoryDashboardData.readiness_score !== undefined && (
                  <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Readiness Score:</h3>
                    <div className="flex items-center gap-2">
                      <Progress value={memoryDashboardData.readiness_score} className="w-full" />
                      <span className="text-sm font-medium">{memoryDashboardData.readiness_score}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This score indicates your project's readiness for the next stage.
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Recommended Actions:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {memoryDashboardData.recommended_next_actions.length > 0 ? (
                      memoryDashboardData.recommended_next_actions.map((action, index) => <li key={index}>{action}</li>)
                    ) : (
                      <li>No specific recommendations at this time. Keep building!</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="mx-auto h-10 w-10 mb-3 text-slate-400" />
                <p>Select a project to view memory insights.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Chat Interface */}
      <div className="lg:w-2/3 h-[calc(100vh-120px)]">
        {" "}
        {/* Adjust height to fit layout */}
        <ChatInterface
          initialChatSessionId={activeChatSessionId}
          onNewChatStarted={handleNewChatStarted}
          onChatLoaded={handleChatLoaded}
        />
      </div>
    </div>
  )
}
