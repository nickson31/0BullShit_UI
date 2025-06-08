import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Pause, Send } from "lucide-react" // Added Send to imports

export default function OutreachPage() {
  const campaigns: Array<{
    id: number
    name: string
    status: string
    progress: number
    sent: number
    responses: number
    meetings: number
    template: string
  }> = [] // Mock data removed

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Outreach Campaigns</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Send className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Outreach Campaigns Yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Create your first campaign to start reaching out.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Campaign
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <Button variant="outline">Edit</Button>
                <Button>
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
    </div>
  )
}
