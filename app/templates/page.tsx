import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function TemplatesPage() {
  const templates = [
    {
      id: 1,
      name: "Default Outreach",
      description: "Standard template for first contact with investors",
      subject: "The \"solar panel\" wind solution for your impact portfolio",
      body: "Hi [Name], I'm [Founder] from Soleólico. We install plug-and-play micro-turbines that reduce electricity bills for stores by up to 40%, without complex permits or construction work..."
    },
    {
      id: 2,
      name: "Follow-up",
      description: "Template for following up after no response",
      subject: "Quick follow-up: Soleólico investment opportunity",
      body: "Hi [Name], I wanted to follow up on my previous message about Soleólico..."
    }
  ]

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Message Templates</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">Subject</h4>
                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                </div>
                <div>
                  <h4 className="font-medium">Message</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
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
    </div>
  )
}
