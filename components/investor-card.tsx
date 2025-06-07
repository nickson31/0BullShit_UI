"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface InvestorCardProps {
  id: string;
  projectId: string;
  name: string;
  company: string;
  location: string;
  investingStage: string;
  categories: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  score?: string;
  onStatusChange?: () => void;
}

export default function InvestorCard({
  id,
  projectId,
  name,
  company,
  location,
  investingStage,
  categories,
  email,
  phone,
  linkedin,
  website,
  score,
  onStatusChange
}: InvestorCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAction = async (sentiment: "like" | "dislike") => {
    if (isLoading) return
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: id,
          sentiment
        })
      })

      if (!response.ok) throw new Error()

      setIsLiked(sentiment === "like")
      setIsDismissed(sentiment === "dislike")
      
      if (onStatusChange) {
        onStatusChange()
      }

      toast({
        title: sentiment === "like" ? "Investor saved" : "Investor dismissed",
        description: sentiment === "like" 
          ? "The investor has been added to your saved list"
          : "The investor has been marked as not interested",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update investor status. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`
        ${isLiked ? "border-green-500" : ""} 
        ${isDismissed ? "border-red-500" : ""}
      `}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{company}</p>
          </div>
          {score && (
            <Badge variant="secondary" className="ml-2">
              {score}% Match
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{location}</Badge>
              <Badge variant="outline">{investingStage}</Badge>
              {categories.map((category, i) => (
                <Badge key={i} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant={isLiked ? "default" : "outline"}
                  onClick={() => handleAction("like")}
                  disabled={isLoading || isDismissed}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Like
                </Button>
                <Button
                  size="sm"
                  variant={isDismissed ? "destructive" : "outline"}
                  onClick={() => handleAction("dislike")}
                  disabled={isLoading || isLiked}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Pass
                </Button>
              </div>
              
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
