"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Pause, Send, Mail, MessageSquare, FileText, Settings } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for campaigns and templates
interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "draft" | "completed"
  progress: number
  sent: number
  responses: number
  meetings: number
  template: string
}

interface MessageTemplate {
  id: string
  name: string
  type: "email" | "linkedin"
  subject?: string
  body: string
}

const mockCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "Seed Round Outreach Q2",
    status: "active",
    progress: 75,
    sent: 150,
    responses: 30,
    meetings: 5,
    template: "Initial Investor Pitch",
  },
  {
    id: "c2",
    name: "Series A Follow-up",
    status: "paused",
    progress: 40,
    sent: 80,
    responses: 10,
    meetings: 2,
    template: "Follow-up Series A",
  },
  {
    id: "c3",
    name: "New Market Entry",
    status: "draft",
    progress: 0,
    sent: 0,
    responses: 0,
    meetings: 0,
    template: "Market Intro Template",
  },
]

const mockTemplates: MessageTemplate[] = [
  {
    id: "t1",
    name: "Initial Investor Pitch",
    type: "email",
    subject: "Investment Opportunity: [Your Company Name]",
    body: "Dear [Investor Name], ...",
  },
  {
    id: "t2",
    name: "Follow-up Series A",
    type: "email",
    subject: "Following Up: [Your Company Name]",
    body: "Hi [Investor Name], ...",
  },
  {
    id: "t3",
    name: "LinkedIn Connection Request",
    type: "linkedin",
    body: "Hi [Investor Name], I'd like to connect...",
  },
]

export default function OutreachPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates)
  const [isLoading, setIsLoading] = useState(false) // Simulate loading
  const { toast } = useToast()

  const handleNewCampaign = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Creating new campaigns is under development.",
    })
  }

  const handleEditCampaign = (campaignId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `Editing campaign ${campaignId} is under development.`,
    })
  }

  const handleToggleCampaignStatus = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, status: campaign.status === "active" ? "paused" : "active" }
          : campaign,
      ),
    )
    toast({
      title: "Campaign Status Updated",
      description: "Campaign status toggled successfully.",
    })
  }

  const handleNewTemplate = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Creating new templates is under development.",
    })
  }

  const handleEditTemplate = (templateId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `Editing template ${templateId} is under development.`,
    })
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Outreach Campaigns</h1>
        <Button onClick={handleNewCampaign}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Send className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Outreach Campaigns Yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Create your first campaign to start reaching out.
          </p>
          <Button onClick={handleNewCampaign}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>Using: {campaign.template}</CardDescription>
                  </div>
                  <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{campaign.progress}%</span>
                    </div>
                    <Progress value={campaign.progress} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{campaign.sent}</p>
                      <p className="text-sm text-muted-foreground">Sent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{campaign.responses}</p>
                      <p className="text-sm text-muted-foreground">Responses</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{campaign.meetings}</p>
                      <p className="text-sm text-muted-foreground">Meetings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEditCampaign(campaign.id)}>
                  Edit
                </Button>
                <Button onClick={() => handleToggleCampaignStatus(campaign.id)}>
                  {campaign.status === "active" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Message Templates</h2>
        <Button onClick={handleNewTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Skeleton className="h-10 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Templates Yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create your first message template.</p>
          <Button onClick={handleNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    {template.type === "email" ? <Mail className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary">{template.type}</Badge>
                </div>
                {template.subject && <CardDescription>Subject: {template.subject}</CardDescription>}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => handleEditTemplate(template.id)}>
                  <Settings className="mr-2 h-4 w-4" /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
