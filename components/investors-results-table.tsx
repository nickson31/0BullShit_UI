"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { InvestorResult } from "@/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Users, ThumbsUp, ThumbsDown } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface InvestorsResultsTableProps {
  investors: InvestorResult[]
  projectId: string
}

export default function InvestorsResultsTable({ investors, projectId }: InvestorsResultsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleViewEmployees = (companyName: string) => {
    router.push(`/employees?company=${encodeURIComponent(companyName)}`)
  }

  const handleSentiment = async (investorId: string, sentiment: "like" | "dislike") => {
    setLoadingStates((prev) => ({ ...prev, [investorId]: true }))

    try {
      await api.updateInvestorSentiment(investorId, sentiment)
      toast({
        title: sentiment === "like" ? "Investor Liked" : "Investor Dismissed",
        description: sentiment === "like" ? "Investor added to your favorites" : "Investor marked as not interested",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update investor status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [investorId]: false }))
    }
  }

  if (!investors || investors.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No investors found matching your criteria.</p>
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border bg-white dark:bg-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Company</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Stage(s)</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Categories</TableHead>
            <TableHead className="text-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((investor) => (
            <TableRow key={investor.id}>
              <TableCell>
                <div className="font-medium">{investor.Company_Name}</div>
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
              <TableCell className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                <div className="truncate" title={investor.Company_Description}>
                  {investor.Company_Description || "-"}
                </div>
              </TableCell>
              <TableCell>
                {(() => {
                  // Handle different types of Investing_Stage data
                  if (Array.isArray(investor.Investing_Stage)) {
                    return investor.Investing_Stage.map((s, index) => (
                      <Badge key={`${s}-${index}`} variant="outline" className="mr-1 mb-1 text-xs">
                        {s}
                      </Badge>
                    ))
                  } else if (typeof investor.Investing_Stage === "string") {
                    const stages = investor.Investing_Stage.split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                    return stages.map((s, index) => (
                      <Badge key={`${s}-${index}`} variant="outline" className="mr-1 mb-1 text-xs">
                        {s}
                      </Badge>
                    ))
                  } else if (investor.Investing_Stage) {
                    return (
                      <Badge variant="outline" className="text-xs">
                        {String(investor.Investing_Stage)}
                      </Badge>
                    )
                  } else {
                    return "-"
                  }
                })()}
              </TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                {investor.Company_Location || "-"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {(() => {
                    // Handle different types of Investment_Categories data
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
                      return "-"
                    }

                    return (
                      <>
                        {categories.slice(0, 2).map((cat, index) => (
                          <Badge key={`${cat}-${index}`} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {categories.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{categories.length - 2} more
                          </Badge>
                        )}
                      </>
                    )
                  })()}
                </div>
              </TableCell>
              <TableCell className="text-center space-x-1">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSentiment(investor.id, "like")}
                    disabled={loadingStates[investor.id]}
                    title="Like Investor"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSentiment(investor.id, "dislike")}
                    disabled={loadingStates[investor.id]}
                    title="Dismiss Investor"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEmployees(investor.Company_Name)}
                    title="View Employees"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
