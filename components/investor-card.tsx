"use client"

import { useState } from "react"
import { Heart, X, Info, MapPin, LinkIcon, Mail, Phone, Linkedin, Star, Building2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type Investor } from "@/types"

interface InvestorCardProps extends Investor {
  onFavoriteToggle?: () => void;
}

export function InvestorCard({
  name,
  company,
  location,
  focus,
  isFavorite,
  onFavoriteToggle,
}: InvestorCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setIsDismissed(false) // Cannot be liked and dismissed
    if (onFavoriteToggle) onFavoriteToggle()
  }

  const handleDismiss = () => {
    setIsDismissed(!isDismissed)
    setIsLiked(false) // Cannot be dismissed and liked
    if (onFavoriteToggle) onFavoriteToggle()
  }

  const handleMoreInfo = () => {
    console.log("More info for:", name)
  }

  const parseStringOrArray = (value: string[] | string | undefined): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    return value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s)
  }

  const investingStages = parseStringOrArray(focus)
  const investmentCategories = parseStringOrArray(focus)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className={isFavorite ? "text-yellow-500" : "text-gray-400"}
        >
          <Star className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="mr-2 h-4 w-4" />
            {company}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Target className="mr-2 h-4 w-4" />
            {focus}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
