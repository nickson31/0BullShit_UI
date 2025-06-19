"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Play,
  Pause,
  Send,
  Mail,
  MessageSquare,
  FileText,
  Settings,
  Edit3,
  BarChart2,
  Loader2,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type OutreachCampaign, type OutreachTemplate, type GenerateTemplateRequest } from "@/services/api"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import OutreachUpsellCard from "@/components/outreach-upsell-card" // Upsell card
import { useRouter } from "next/navigation" // Import router

export default function OutreachPage() {
  const { toast } = useToast()
  const { currentProject, profile, isLoadingProfile: isLoadingAppUser } = useApp()
  const router = useRouter() // Declare router

  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([])
  const [templates, setTemplates] = useState<OutreachTemplate[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // --- Campaign Management ---
  const fetchCampaigns = useCallback(async () => {
    if (!currentProject?.id || profile?.subscription_plan === "free" || profile?.subscription_plan === "growth") return
    setIsLoadingCampaigns(true)
    try {
      const fetchedCampaigns = await api.getOutreachCampaigns(currentProject.id) // Simulated
      setCampaigns(fetchedCampaigns)
    } catch (error) {
      toast({ title: "Error Fetching Campaigns", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [currentProject?.id, toast, profile?.subscription_plan])

  // --- Template Management ---
  const fetchTemplates = useCallback(async () => {
    if (!currentProject?.id || profile?.subscription_plan === "free" || profile?.subscription_plan === "growth") return
    setIsLoadingTemplates(true)
    try {
      const fetchedTemplates = await api.getOutreachTemplates(currentProject.id) // Simulated
      setTemplates(fetchedTemplates)
    } catch (error) {
      toast({ title: "Error Fetching Templates", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsLoadingTemplates(false)
    }
  }, [currentProject?.id, toast, profile?.subscription_plan])

  useEffect(() => {
    if (!isLoadingAppUser && currentProject) {
      fetchCampaigns()
      fetchTemplates()
    }
  }, [isLoadingAppUser, currentProject, fetchCampaigns, fetchTemplates])

  const handleNewCampaign = () => {
    toast({ title: "New Campaign", description: "Campaign creation wizard coming soon." })
  }
  const handleToggleCampaignStatus = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)),
    )
    toast({ title: "Campaign Status Updated" })
  }

  const handleGenerateTemplate = async () => {
    if (!currentProject) {
      toast({ title: "No Project Selected", variant: "destructive" })
      return
    }
    toast({ title: "Generating Template...", description: "AI is crafting your outreach message." })
    try {
      const requestData: GenerateTemplateRequest = {
        project_id: currentProject.id,
        context: {
          /* TODO: Gather context for template, e.g., target audience, project summary */
          target_audience: "Seed stage VCs in Fintech",
          project_summary: currentProject.description || "A promising new venture.",
        },
      }
      const response = await api.generateOutreachTemplate(requestData)
      // Add to local state or refetch
      const newTemplate: OutreachTemplate = {
        id: `template-${Date.now()}`,
        name: `AI Generated Template ${templates.length + 1}`,
        type: "email", // Assuming email for now
        body: response.template,
        created_at: new Date().toISOString(),
      }
      setTemplates((prev) => [newTemplate, ...prev])
      toast({ title: "Template Generated!", description: "New outreach template created by AI." })
    } catch (error) {
      toast({ title: "Template Generation Failed", description: (error as Error).message, variant: "destructive" })
    }
  }

  const isLoading = isLoadingAppUser || isLoadingCampaigns || isLoadingTemplates

  if (isLoadingAppUser) {
    // Initial loading for user profile (and plan)
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-40 w-full mb-6" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (profile?.subscription_plan !== "pro") {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Send className="h-16 w-16 text-green-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-center">Unlock Automated Outreach</h1>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
          Supercharge your investor connections with AI-powered template generation, automated sequences, and response
          analytics. Upgrade to the Pro plan.
        </p>
        <OutreachUpsellCard onUnlock={() => router.push("/credits")} />
      </div>
    )
  }

  if (!currentProject && !isLoadingAppUser) {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Send className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Project Selected</h2>
        <p className="text-md text-slate-500 dark:text-slate-400 max-w-md text-center">
          Please select a project to manage outreach campaigns and templates.
        </p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      {/* Campaigns Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Outreach Campaigns</h2>
        <Button onClick={handleNewCampaign} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" /> New Campaign
        </Button>
      </div>
      {isLoadingCampaigns ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter className="gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg mb-8">
          <Send className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
          <p className="text-muted-foreground mb-4">Start your first outreach campaign.</p>
          <Button onClick={handleNewCampaign}>Create Campaign</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription>
                      Template: {templates.find((t) => t.id === campaign.template_id)?.name || campaign.template_id}
                    </CardDescription>
                  </div>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"} className="capitalize">
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>
                      {campaign.metrics.sent > 0
                        ? Math.round((campaign.metrics.responses / campaign.metrics.sent) * 100)
                        : 0}
                      % response rate
                    </span>
                  </div>
                  <Progress
                    value={
                      campaign.metrics.sent > 0
                        ? Math.round((campaign.metrics.responses / campaign.metrics.sent) * 100)
                        : 0
                    }
                    className="h-2"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-xl font-bold">{campaign.metrics.sent}</p>
                    <p className="text-muted-foreground">Sent</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{campaign.metrics.responses}</p>
                    <p className="text-muted-foreground">Responses</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{campaign.metrics.meetings}</p>
                    <p className="text-muted-foreground">Meetings</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => toast({ title: "View Analytics" })}>
                  <BarChart2 className="mr-1.5 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Campaign" })}>
                  <Edit3 className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                <Button size="sm" onClick={() => handleToggleCampaignStatus(campaign.id)}>
                  {campaign.status === "active" ? (
                    <>
                      <Pause className="mr-1.5 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-1.5 h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Templates Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Message Templates</h2>
        <Button onClick={handleGenerateTemplate} disabled={isLoading}>
          {isLoadingTemplates && templates.length === 0 ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Generate with AI
        </Button>
      </div>
      {isLoadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Templates Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first message template or generate one with AI.</p>
          <Button onClick={handleGenerateTemplate}>Generate with AI</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    {template.type === "email" ? (
                      <Mail className="h-5 w-5 text-blue-500" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-500" />
                    )}
                    {template.name}
                  </CardTitle>
                  <Badge variant="outline" className="capitalize">
                    {template.type}
                  </Badge>
                </div>
                {template.subject && <CardDescription className="text-xs">Subject: {template.subject}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Created: {format(new Date(template.created_at), "MMM d, yyyy")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => toast({ title: "Edit Template" })}>
                  <Settings className="mr-1.5 h-4 w-4" /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
