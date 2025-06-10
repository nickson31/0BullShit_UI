"use client"

import type React from "react"

import type { InvestorResult } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CompactInvestorCardProps {
  investor: InvestorResult
  onLike: (investorId: string) => void
  onDislike: (investorId: string) => void
  isFavorite: boolean
  isLoading: boolean
}

export default function CompactInvestorCard({
  investor,
  onLike,
  onDislike,
  isFavorite,
  isLoading,
}: CompactInvestorCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onLike(investor.id)
  }

  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDislike(investor.id)
  }

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold leading-tight">{investor.Company_Name}</CardTitle>
          {investor.Company_Website && (
            <a
              href={
                investor.Company_Website.startsWith("http")
                  ? investor.Company_Website
                  : `https://${investor.Company_Website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-600"
              title="Visit website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
          {investor.Company_Description || "No description available."}
        </p>
        <div className="flex flex-wrap gap-1 mb-1">
          {Array.isArray(investor.Investing_Stage)
            ? investor.Investing_Stage.slice(0, 2).map((s, index) => (
                <Badge key={`${s}-${index}`} variant="outline" className="text-xs px-1.5 py-0.5">
                  {s}
                </Badge>
              ))
            : typeof investor.Investing_Stage === "string" && investor.Investing_Stage
              ? investor.Investing_Stage.split(",")
                  .slice(0, 2)
                  .map((s, index) => (
                    <Badge key={`${s.trim()}-${index}`} variant="outline" className="text-xs px-1.5 py-0.5">
                      {s.trim()}
                    </Badge>
                  ))
              : null}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-3 pt-0 flex justify-end space-x-2">
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="sm"
          onClick={handleLike}
          disabled={isLoading}
          className={cn("h-7 w-7 p-0", isFavorite && "bg-green-500 hover:bg-green-600 border-green-500")}
          title="Like Investor"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDislike}
          disabled={isLoading || isFavorite} // Disable dislike if liked or loading
          className="h-7 w-7 p-0"
          title="Dislike Investor"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
