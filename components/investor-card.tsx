"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, MoreHorizontal, Users } from "lucide-react"
import { motion } from "framer-motion"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface InvestorCardProps {
  id: string
  projectId: string
  name: string
  company: string
  location: string
  investingStage: string | string[]
  categories: string[]
  email?: string
  phone?: string
  linkedin?: string
  website?: string
  score?: string
  showActions?: boolean
  onStatusChange?: () => void
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
  showActions = true,
  onStatusChange,
}: InvestorCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleAction = async (sentiment: "like" | "dislike") => {
    if (isLoading) return
    setIsLoading(true)

    try {
      await api.updateInvestorSentiment(projectId, id, sentiment)

      setIsLiked(sentiment === "like")
      setIsDismissed(sentiment === "dislike")

      if (onStatusChange) {
        onStatusChange()
      }

      toast({
        title: sentiment === "like" ? "Investor saved" : "Investor dismissed",
        description:
          sentiment === "like"
            ? "The investor has been added to your saved list"
            : "The investor has been marked as not interested",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update investor status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewEmployees = () => {
    router.push(`/employees?company=${encodeURIComponent(company)}`)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Card
        className={`
        ${isLiked ? "border-green-500" : ""} 
        ${isDismissed ? "border-red-500" : ""}
      `}
      >
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
              {typeof investingStage === "string" ? (
                <Badge variant="outline">{investingStage}</Badge>
              ) : (
                investingStage.map((stage, i) => (
                  <Badge key={i} variant="outline">
                    {stage}
                  </Badge>
                ))
              )}
              {categories.map((category, i) => (
                <Badge key={i} variant="outline">
                  {category}
                </Badge>
              ))}
            </div>

            {showActions && (
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

                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={handleViewEmployees}>
                    <Users className="h-4 w-4 mr-1" />
                    Employees
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
