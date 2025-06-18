"use client"

import type React from "react"
import { useRouter } from "next/navigation" // Import useRouter
import type { InvestorResult } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, X, ExternalLink, Linkedin, FileText, MapPin } from "lucide-react" // Added Linkedin, FileText, MapPin
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Added Tooltip

interface CompactInvestorCardProps {
  investor: InvestorResult
  onToggleFavorite: (investorId: string) => void
  onDislikeAction: (investorId: string) => void
  // Removed onGenerateTemplate as it will be handled by router push directly
  isFavorite: boolean
  isLoading: boolean
}

export default function CompactInvestorCard({
  investor,
  onToggleFavorite,
  onDislikeAction,
  isFavorite,
  isLoading,
}: CompactInvestorCardProps) {
  const router = useRouter() // Initialize router

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(investor.id)
  }

  const handleXClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDislikeAction(investor.id)
  }

  const handleGenerateTemplateClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/templates?entityId=${investor.id}&entityType=investor`)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between min-h-[210px]">
        <div>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex justify-between items-start">
              {" "}
              {/* Title and Icons */}
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2 flex-grow min-w-0 pr-2">
                {investor.Company_Name}
              </CardTitle>
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                {" "}
                {/* Icons container */}
                {investor.Company_Linkedin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={
                          investor.Company_Linkedin.startsWith("http")
                            ? investor.Company_Linkedin
                            : `https://${investor.Company_Linkedin}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-blue-600"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>LinkedIn</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {investor.Company_Website && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={
                          investor.Company_Website.startsWith("http")
                            ? investor.Company_Website
                            : `https://${investor.Company_Website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-blue-600"
                        title="Visit website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Website</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            {/* Score and Location on a new line */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 space-x-2">
              {investor.Company_Location && (
                <div className="flex items-center truncate">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{investor.Company_Location}</span>
                </div>
              )}
              {investor.Score && (
                <Badge
                  variant="outline"
                  className="text-xs px-1.5 py-0.5 whitespace-nowrap border-green-400 text-green-700 bg-green-50 dark:border-green-600 dark:text-green-300 dark:bg-green-900/50 flex-shrink-0"
                >
                  {Number.parseFloat(investor.Score).toFixed(0)}% Match
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 h-8">
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

              {/* Updated Investment Categories display */}
              {investor.Investment_Categories &&
                investor.Investment_Categories.length > 0 &&
                investor.Investment_Categories.slice(0, 2).map(
                  (
                    cat,
                    index, // Show up to 2 categories
                  ) => (
                    <Badge key={`${cat}-${index}-cat`} variant="secondary" className="text-xs px-1.5 py-0.5">
                      {cat}
                    </Badge>
                  ),
                )}
              {investor.Investment_Categories &&
                investor.Investment_Categories.length > 2 && ( // If more than 2
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{investor.Investment_Categories.length - 2} more
                  </Badge>
                )}
            </div>
          </CardContent>
        </div>
        <CardFooter className="px-4 pb-3 pt-2 flex justify-end items-center space-x-2 border-t mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateTemplateClick}
            disabled={isLoading}
            className="h-7 px-2 py-1 text-xs flex-grow"
            title="Generate Template"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Template
          </Button>
          <div className="flex space-x-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleHeartClick}
                  disabled={isLoading}
                  className={cn(
                    "h-7 w-7 p-0 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900",
                    isFavorite ? "text-pink-500" : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  <Heart className={cn("h-4 w-4", isFavorite ? "fill-pink-500" : "")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "Unlike Investor" : "Like Investor"}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleXClick}
                  disabled={isLoading}
                  className="h-7 w-7 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Dislike Investor</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
