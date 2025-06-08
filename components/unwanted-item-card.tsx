"use client"

import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, User, Building } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface UnwantedItem {
  id: string // This is the sentiment ID
  entity_id: string
  entity_type: "investor" | "employee"
  entity_name: string // e.g., "Ana Soler" or "Climate Seed"
  entity_info: string // e.g., "Climate Seed" or "Software Engineer"
}

interface UnwantedItemCardProps {
  item: UnwantedItem
  onRemove: (sentimentId: string) => void
}

export default function UnwantedItemCard({ item, onRemove }: UnwantedItemCardProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleRemoveSentiment = async () => {
    setIsLoading(true)
    try {
      await api.removeSentiment(item.id)
      toast({
        title: "Item Restored",
        description: `${item.entity_name} has been removed from the unwanted list.`,
      })
      onRemove(item.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore the item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const Icon = item.entity_type === "investor" ? Building : User

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{item.entity_name}</CardTitle>
          <Badge variant="secondary" className="capitalize">
            <Icon className="h-3 w-3 mr-1.5" />
            {item.entity_type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{item.entity_info}</p>
      </CardHeader>
      <CardContent>
        <Button onClick={handleRemoveSentiment} disabled={isLoading} className="w-full" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          {isLoading ? "Restoring..." : "Undo 'Dislike'"}
        </Button>
      </CardContent>
    </Card>
  )
}
