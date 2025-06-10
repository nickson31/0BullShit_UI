"use client"

import { useState } from "react"
import type { EmployeeResult } from "@/services/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, ThumbsUp, ThumbsDown, Mail } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"

interface EmployeesResultsTableProps {
  employees: EmployeeResult[]
  projectId: string
  showLimit?: boolean
  maxResults?: number
}

export default function EmployeesResultsTable({
  employees,
  projectId,
  showLimit = false,
  maxResults = 5,
}: EmployeesResultsTableProps) {
  const { toast } = useToast()
  const { addToFavorites, removeFromFavorites, favoriteEmployees } = useApp()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const displayedEmployees = showLimit && !isExpanded ? employees.slice(0, maxResults) : employees
  const hasMore = showLimit && !isExpanded && employees.length > maxResults

  // Remover auto-guardado de las tablas para evitar duplicación
  // El auto-guardado se hace solo desde el chat-interface

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const handleSentiment = async (employee: EmployeeResult, sentiment: "like" | "dislike") => {
    setLoadingStates((prev) => ({ ...prev, [employee.id]: true }))

    try {
      await api.updateEmployeeSentiment(employee.id, sentiment)

      if (sentiment === "like") {
        addToFavorites(employee, "employee")
        toast({
          title: "Employee Liked",
          description: "Employee added to your favorites",
        })
      } else {
        removeFromFavorites(employee.id, "employee")
        toast({
          title: "Employee Dismissed",
          description: "Employee marked as not interested",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
    }
  }

  const isInFavorites = (employeeId: string) => {
    return Array.isArray(favoriteEmployees) && favoriteEmployees.some((emp) => emp.id === employeeId)
  }

  if (!employees || employees.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No employees found matching your criteria.</p>
  }

  return (
    <div className="space-y-4">
      {/* Contenedor con scroll horizontal forzado */}
      <div className="w-full overflow-x-auto border rounded-md bg-white dark:bg-slate-800">
        <div style={{ minWidth: "900px" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold w-[200px] sticky left-0 bg-white dark:bg-slate-800 z-10 border-r">
                  Employee
                </TableHead>
                <TableHead className="font-semibold w-[250px]">Headline</TableHead>
                <TableHead className="font-semibold w-[150px]">Current Role</TableHead>
                <TableHead className="font-semibold w-[120px]">Location</TableHead>
                <TableHead className="font-semibold w-[100px]">Contact</TableHead>
                <TableHead className="text-center font-semibold w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="w-[200px] sticky left-0 bg-white dark:bg-slate-800 z-10 border-r">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={employee.profilePic || "/placeholder.svg"} alt={employee.fullName} />
                        <AvatarFallback className="text-xs">
                          {employee.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                          {employee.fullName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-300 w-[250px]">
                    <div className="line-clamp-2 text-xs leading-relaxed" title={employee.headline}>
                      {employee.headline || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm w-[150px]">
                    <div
                      className="text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                      title={employee.current_job_title}
                    >
                      {employee.current_job_title || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-300 w-[120px]">
                    <div className="text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={employee.location}>
                      {employee.location || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <div className="flex items-center gap-2 justify-center">
                      {employee.email && (
                        <a
                          href={`mailto:${employee.email}`}
                          className="text-blue-600 hover:underline"
                          title="Send Email"
                        >
                          <Mail className="h-3 w-3" />
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
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant={isInFavorites(employee.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSentiment(employee, "like")}
                        disabled={loadingStates[employee.id]}
                        title="Like Employee"
                        className="h-8 w-8 p-0"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSentiment(employee, "dislike")}
                        disabled={loadingStates[employee.id]}
                        title="Dismiss Employee"
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
            {isExpanded ? `Show Less (${maxResults})` : `See All ${employees.length} Employees`}
          </Button>
        </div>
      )}
    </div>
  )
}
