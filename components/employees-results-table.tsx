"use client"

import { useState } from "react"
import type { EmployeeResult } from "@/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, ThumbsUp, ThumbsDown, Mail } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface EmployeesResultsTableProps {
  employees: EmployeeResult[]
  projectId: string
}

export default function EmployeesResultsTable({ employees, projectId }: EmployeesResultsTableProps) {
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleSentiment = async (employeeId: string, sentiment: "like" | "dislike") => {
    setLoadingStates((prev) => ({ ...prev, [employeeId]: true }))

    try {
      await api.updateEmployeeSentiment(employeeId, sentiment)
      toast({
        title: sentiment === "like" ? "Employee Liked" : "Employee Dismissed",
        description: sentiment === "like" ? "Employee added to your favorites" : "Employee marked as not interested",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [employeeId]: false }))
    }
  }

  if (!employees || employees.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No employees found matching your criteria.</p>
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border bg-white dark:bg-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Employee</TableHead>
            <TableHead className="font-semibold">Headline</TableHead>
            <TableHead className="font-semibold">Current Role</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="text-center font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.profilePic || "/placeholder.svg"} alt={employee.fullName} />
                    <AvatarFallback>
                      {employee.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.fullName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
                <div className="truncate" title={employee.headline}>
                  {employee.headline || "-"}
                </div>
              </TableCell>
              <TableCell className="text-sm">{employee.current_job_title || "-"}</TableCell>
              <TableCell className="text-sm text-slate-600 dark:text-slate-300">{employee.location || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {employee.email && (
                    <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline" title="Send Email">
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {employee.linkedinUrl && (
                    <a
                      href={employee.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      title="View LinkedIn"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSentiment(employee.id, "like")}
                    disabled={loadingStates[employee.id]}
                    title="Like Employee"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSentiment(employee.id, "dislike")}
                    disabled={loadingStates[employee.id]}
                    title="Dismiss Employee"
                  >
                    <ThumbsDown className="h-4 w-4" />
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
