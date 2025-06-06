"use client"

import { useState } from "react"
import { Heart, X, Info, MapPin, LinkIcon, Mail, Phone, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Investor {
  id: string
  Company_Name: string
  Company_Description: string
  Investing_Stage: string[] | string // Can be array or comma-separated string
  Company_Location: string
  Investment_Categories: string[] | string // Can be array or comma-separated string
  Company_Email?: string
  Company_Phone?: string
  Company_Linkedin?: string
  Company_Website?: string
  Score: string // Score is a string like "85.2"
}

interface InvestorCardProps {
  investor: Investor
  onLike?: (id: string) => void
  onDismiss?: (id: string) => void
  onMoreInfo?: (id: string) => void
}

export default function InvestorCard({ investor, onLike, onDismiss, onMoreInfo }: InvestorCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setIsDismissed(false) // Cannot be liked and dismissed
    if (onLike) onLike(investor.id)
  }

  const handleDismiss = () => {
    setIsDismissed(!isDismissed)
    setIsLiked(false) // Cannot be dismissed and liked
    if (onDismiss) onDismiss(investor.id)
  }

  const handleMoreInfo = () => {
    if (onMoreInfo) onMoreInfo(investor.id)
    else console.log("More info for:", investor.id)
  }

  const parseStringOrArray = (value: string[] | string | undefined): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s)
  }

  const investingStages = parseStringOrArray(investor.Investing_Stage)
  const investmentCategories = parseStringOrArray(investor.Investment_Categories)

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 shadow-sm transition-opacity duration-300 w-full",
        isDismissed ? "opacity-50" : "opacity-100",
      )}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-slate-800">{investor.Company_Name}</h2>
          <Badge variant="outline" className="text-sm text-blue-600 border-blue-300 bg-blue-50">
            Score: {investor.Score}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 mb-3 line-clamp-3">{investor.Company_Description}</p>

        {investingStages.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-slate-500 mb-1">Investing Stage</h4>
            <div className="flex flex-wrap gap-1.5">
              {investingStages.map((stage) => (
                <Badge
                  key={stage}
                  variant="secondary"
                  className="text-xs bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {investmentCategories.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-slate-500 mb-1">Investment Categories</h4>
            <div className="flex flex-wrap gap-1.5">
              {investmentCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="text-xs bg-teal-100 text-teal-800 hover:bg-teal-200"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-sm text-slate-600 mb-3">
          {investor.Company_Location && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-2 text-slate-500" />
              <span>{investor.Company_Location}</span>
            </div>
          )}
          {investor.Company_Website && (
            <div className="flex items-center">
              <LinkIcon className="h-3.5 w-3.5 mr-2 text-slate-500" />
              <a
                href={
                  investor.Company_Website.startsWith("http")
                    ? investor.Company_Website
                    : `https://${investor.Company_Website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {investor.Company_Website}
              </a>
            </div>
          )}
          {investor.Company_Email && (
            <div className="flex items-center">
              <Mail className="h-3.5 w-3.5 mr-2 text-slate-500" />
              <a href={`mailto:${investor.Company_Email}`} className="text-blue-600 hover:underline truncate">
                {investor.Company_Email}
              </a>
            </div>
          )}
          {investor.Company_Phone && (
            <div className="flex items-center">
              <Phone className="h-3.5 w-3.5 mr-2 text-slate-500" />
              <span>{investor.Company_Phone}</span>
            </div>
          )}
          {investor.Company_Linkedin && (
            <div className="flex items-center">
              <Linkedin className="h-3.5 w-3.5 mr-2 text-slate-500" />
              <a
                href={
                  investor.Company_Linkedin.startsWith("http")
                    ? investor.Company_Linkedin
                    : `https://${investor.Company_Linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {investor.Company_Linkedin}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end items-center p-3 border-t border-slate-200 bg-slate-50/50 rounded-b-lg space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className={cn(
            "h-8 w-8 text-slate-500 hover:bg-slate-200",
            isLiked && "text-red-500 hover:text-red-600 hover:bg-red-100",
          )}
          aria-pressed={isLiked}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          <span className="sr-only">Like</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 text-slate-500 hover:bg-slate-200"
          aria-pressed={isDismissed}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMoreInfo}
          className="h-8 w-8 text-slate-500 hover:bg-slate-200"
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">More Info</span>
        </Button>
      </div>
    </div>
  )
}
