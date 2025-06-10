"use client"

import { useState } from "react"
import type { InvestorResult } from "@/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"

interface InvestorsResultsTableProps {
  investors: InvestorResult[]
  projectId: string
  showLimit?: boolean
  maxResults?: number
}

export default function InvestorsResultsTable({
  investors,
  projectId,
  showLimit = false,
  maxResults = 5,
}: InvestorsResultsTableProps) {
  const { toast } = useToast()
  const { addToFavorites, removeFromFavorites, favoriteInvestors } = useApp()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedInvestors = showLimit && !isExpanded ? investors.slice(0, maxResults) : investors
  const hasMore = showLimit && !isExpanded && investors.length > maxResults

  // Remover auto-guardado de las tablas para evitar duplicación
  // El auto-guardado se hace solo desde el chat-interface

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSentiment = async (investor: InvestorResult, sentiment: "like" | "dislike") => {
    setLoadingStates((prev) => ({ ...prev, [investor.id]: true }))

    try {
      await api.updateInvestorSentiment(investor.id, sentiment)

      if (sentiment === "like") {
        addToFavorites(investor, "investor")
        toast({
          title: "Investor Liked",
          description: "Investor added to your favorites",
        })
      } else {
        removeFromFavorites(investor.id, "investor")
        toast({
          title: "Investor Dismissed",
          description: "Investor marked as not interested",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update investor status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [investor.id]: false }))
    }
  }

  const isInFavorites = (investorId: string) => {
    return Array.isArray(favoriteInvestors) && favoriteInvestors.some((inv) => inv.id === investorId)
  }

  if (!investors || investors.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No investors found matching your criteria.</p>
  }

  return (
    <div className="space-y-4">
      {/* Contenedor con scroll horizontal forzado */}
      <div className="w-full overflow-x-auto border rounded-md bg-white dark:bg-slate-800">
        <div style={{ minWidth: "1200px" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold w-[200px] sticky left-0 bg-white dark:bg-slate-800 z-10 border-r">
                  Company
                </TableHead>
                <TableHead className="font-semibold w-[300px]">Description</TableHead>
                <TableHead className="font-semibold w-[180px]">Stage(s)</TableHead>
                <TableHead className="font-semibold w-[150px]">Location</TableHead>
                <TableHead className="font-semibold w-[250px]">Categories</TableHead>
                <TableHead className="text-center font-semibold w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvestors.map((investor) => (
                <TableRow key={investor.id}>
                  <TableCell className="w-[200px] sticky left-0 bg-white dark:bg-slate-800 z-10 border-r">
                    <div className="font-medium text-sm">{investor.Company_Name}</div>
                    {investor.Company_Linkedin && (
                      <a
                        href={investor.Company_Linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                      >
                        LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-300 w-[300px]">
                    <div className="line-clamp-3 text-xs leading-relaxed" title={investor.Company_Description}>
                      {investor.Company_Description || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="w-[180px]">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        if (Array.isArray(investor.Investing_Stage)) {
                          return investor.Investing_Stage.slice(0, 2).map((s, index) => (
                            <Badge key={`${s}-${index}`} variant="outline" className="text-xs whitespace-nowrap">
                              {s}
                            </Badge>
                          ))
                        } else if (typeof investor.Investing_Stage === "string") {
                          const stages = investor.Investing_Stage.split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                          return stages.slice(0, 2).map((s, index) => (
                            <Badge key={`${s}-${index}`} variant="outline" className="text-xs whitespace-nowrap">
                              {s}
                            </Badge>
                          ))
                        } else if (investor.Investing_Stage) {
                          return (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {String(investor.Investing_Stage)}
                            </Badge>
                          )
                        } else {
                          return <span className="text-xs text-slate-400">-</span>
                        }
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-300 w-[150px]">
                    <div
                      className="text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                      title={investor.Company_Location}
                    >
                      {investor.Company_Location || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="w-[250px]">
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        let categories: string[] = []

                        if (Array.isArray(investor.Investment_Categories)) {
                          categories = investor.Investment_Categories
                        } else if (typeof investor.Investment_Categories === "string") {
                          categories = investor.Investment_Categories.split(",")
                            .map((cat) => cat.trim())
                            .filter(Boolean)
                        } else if (investor.Investment_Categories) {
                          categories = [String(investor.Investment_Categories)]
                        }

                        if (categories.length === 0) {
                          return <span className="text-xs text-slate-400">-</span>
                        }

                        return (
                          <>
                            {categories.slice(0, 3).map((cat, index) => (
                              <Badge key={`${cat}-${index}`} variant="secondary" className="text-xs whitespace-nowrap">
                                {cat}
                              </Badge>
                            ))}
                            {categories.length > 3 && (
                              <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                +{categories.length - 3}
                              </Badge>
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-center w-[180px]">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant={isInFavorites(investor.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSentiment(investor, "like")}
                        disabled={loadingStates[investor.id]}
                        title="Like Investor"
                        className="h-8 w-8 p-0"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSentiment(investor, "dislike")}
                        disabled={loadingStates[investor.id]}
                        title="Dismiss Investor"
                        className="h-8 w-8 p-0"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={handleToggleExpand} variant="outline" className="w-full max-w-xs">
            {isExpanded ? `Show Less (${maxResults})` : `See All ${investors.length} Investors`}
          </Button>
        </div>
      )}
    </div>
  )
}
