"use client"

import { BrainCircuit, Info, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/contexts/AppContext"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export default function MemoryPage() {
  const { currentProject, isLoadingProfile } = useApp()
  const { toast } = useToast()

  // Mock data for memory dashboard - replace with actual API fetch later
  const mockMemoryStats = {
    totalEntries: 125,
    lastUpdated: "2024-06-18 10:30 AM",
    memoryUsage: "75%",
    connectedSources: 5,
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Neural Memory</h1>
        <Button
          onClick={() =>
            toast({ title: "Feature Coming Soon", description: "Memory management is under development." })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Memory Source
        </Button>
      </div>

      {isLoadingProfile ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-blue-500" />
                Project Memory Dashboard
              </CardTitle>
              <CardDescription>
                Overview of the neural memory for your current project:{" "}
                <span className="font-semibold text-foreground">{currentProject?.name || "No Project Selected"}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Memory Entries</p>
                  <p className="text-2xl font-bold">{mockMemoryStats.totalEntries}</p>
                </div>
                <Info className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-bold">{mockMemoryStats.lastUpdated}</p>
                </div>
                <Info className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Memory Usage</p>
                  <p className="text-2xl font-bold">{mockMemoryStats.memoryUsage}</p>
                </div>
                <Info className="h-6 w-6 text-slate-400" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Connected Sources</p>
                  <p className="text-2xl font-bold">{mockMemoryStats.connectedSources}</p>
                </div>
                <Info className="h-6 w-6 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <BrainCircuit className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Neural Memory Editor</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your project's context and memory here. This feature is under construction.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
