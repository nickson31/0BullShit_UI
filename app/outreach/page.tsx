import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Pause } from "lucide-react"

export default function OutreachPage() {
  const campaigns = [
    {
      id: 1,
      name: "Climate Tech VCs",
      status: "active",
      progress: 65,
      sent: 13,
      responses: 5,
      meetings: 2,
      template: "Default Outreach"
    },
    {
      id: 2,
      name: "Angel Investors",
      status: "paused",
      progress: 30,
      sent: 6,
      responses: 1,
      meetings: 0,
      template: "Custom Template 1"
    }
  ]

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Outreach Campaigns</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{campaign.name}</CardTitle>
                  <CardDescription>Using: {campaign.template}</CardDescription>
                </div>
                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                  {campaign.status}
                </Badge>
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
                  <><Pause className="mr-2 h-4 w-4" />Pause</>
                ) : (
                  <><Play className="mr-2 h-4 w-4" />Resume</>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
