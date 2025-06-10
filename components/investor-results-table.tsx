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

interface InvestorResultsTableProps {
  investors: InvestorResult[]
  projectId: string
}

export default function InvestorResultsTable({ investors, projectId }: InvestorResultsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [sentiments, setSentiments] = useState<Record<string, "like" | "dislike" | null>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleViewEmployees = (companyName: string) => {
    router.push(`/employees?company=${encodeURIComponent(companyName)}`)
  }

  const handleSentiment = async (investorId: string, sentiment: "like" | "dislike") => {
    setLoadingStates((prev) => ({ ...prev, [investorId]: true }))

    try {
      await api.updateInvestorSentiment(projectId, investorId, sentiment)
      setSentiments((prev) => ({ ...prev, [investorId]: sentiment }))

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
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Stage(s)</TableHead>
            <TableHead className="font-semibold">Categories</TableHead>
            <TableHead className="text-right font-semibold">Score</TableHead>
            <TableHead className="text-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investors.map((investor) => (
            <TableRow
              key={investor.id}
              className={
                sentiments[investor.id] === "like"
                  ? "bg-green-50 dark:bg-green-900/20"
                  : sentiments[investor.id] === "dislike"
                    ? "bg-red-50 dark:bg-red-900/20"
                    : ""
              }
            >
              <TableCell>
                <div className="font-medium">{investor.Company_Name}</div>
                {investor.Company_Website && (
                  <a
                    href={
                      investor.Company_Website.startsWith("http")
                        ? investor.Company_Website
                        : `https://${investor.Company_Website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center"
                  >
                    Website <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                {investor.Company_Location || "-"}
              </TableCell>
              <TableCell>
                {Array.isArray(investor.Investing_Stage) ? (
                  investor.Investing_Stage.map((s) => (
                    <Badge key={s} variant="outline" className="mr-1 mb-1 text-xs">
                      {s}
                    </Badge>
                  ))
                ) : investor.Investing_Stage ? (
                  <Badge variant="outline" className="text-xs">
                    {investor.Investing_Stage}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {investor.Investment_Categories && investor.Investment_Categories.length > 0
                    ? investor.Investment_Categories.slice(0, 3).map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))
                    : "-"}
                  {investor.Investment_Categories && investor.Investment_Categories.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{investor.Investment_Categories.length - 3} more
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {investor.Score ? (
                  <Badge className="text-sm">{Number.parseFloat(investor.Score).toFixed(1)}%</Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Button
                    variant={sentiments[investor.id] === "like" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSentiment(investor.id, "like")}
                    disabled={loadingStates[investor.id] || sentiments[investor.id] === "dislike"}
                    className="h-8 w-8 p-0"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="sr-only">Like</span>
                  </Button>

                  <Button
                    variant={sentiments[investor.id] === "dislike" ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleSentiment(investor.id, "dislike")}
                    disabled={loadingStates[investor.id] || sentiments[investor.id] === "like"}
                    className="h-8 w-8 p-0"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="sr-only">Dislike</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewEmployees(investor.Company_Name)}
                    title="View Employees"
                    className="h-8 w-8 p-0"
                  >
                    <Users className="h-4 w-4" />
                    <span className="sr-only">View Employees</span>
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
