"use client"

import { useRouter } from "next/navigation" // Changed from "next/navigation"
import type { InvestorResult } from "@/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Users } from "lucide-react"

interface InvestorResultsTableProps {
  investors: InvestorResult[]
  projectId: string // Needed for potential future actions like saving sentiment from table
}

export default function InvestorResultsTable({ investors, projectId }: InvestorResultsTableProps) {
  const router = useRouter()

  const handleViewEmployees = (companyName: string) => {
    router.push(`/employees?company=${encodeURIComponent(companyName)}`)
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
            <TableRow key={investor.id}>
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
              <TableCell className="text-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewEmployees(investor.Company_Name)}
                  title="View Employees"
                >
                  <Users className="h-4 w-4" />
                  <span className="sr-only">View Employees</span>
                </Button>
                {/* Add Like/Dislike buttons here if needed, similar to InvestorCard */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
