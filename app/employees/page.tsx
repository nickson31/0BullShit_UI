"use client"

import { useApp } from "@/contexts/AppContext"
import { UserCircle2 } from "lucide-react"
import EmployeeFundCard from "@/components/employee-fund-card"
import { useToast } from "@/components/ui/use-toast"
import { api, type EmployeeResult } from "@/services/api"
import { useCallback, useState, useMemo } from "react"

export default function EmployeesPage() {
  const { lastEmployeeResults, favoriteEmployees, addToFavorites, removeFromFavorites } = useApp()
  const { toast } = useToast()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleEmployeeLikeDislike = useCallback(
    async (employee: EmployeeResult, action: "like" | "dislike") => {
      setLoadingStates((prev) => ({ ...prev, [employee.id]: true }))
      try {
        await api.updateEmployeeSentiment(employee.id, action)
        if (action === "like") {
          addToFavorites(employee, "employee")
          toast({ title: "Employee Liked", description: `${employee.fullName} added to favorites.` })
        } else {
          removeFromFavorites(employee.id, "employee")
          toast({ title: "Employee Disliked", description: `${employee.fullName} removed from favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update employee status.", variant: "destructive" })
      } finally {
        setLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
      }
    },
    [addToFavorites, removeFromFavorites, toast],
  )

  const employeesByFund = useMemo(() => {
    if (!lastEmployeeResults) return {}
    return lastEmployeeResults.reduce(
      (acc, emp) => {
        const company = emp.current_company_name || "Unknown Fund"
        if (!acc[company]) acc[company] = []
        acc[company].push(emp)
        return acc
      },
      {} as Record<string, EmployeeResult[]>,
    )
  }, [lastEmployeeResults])

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Employee Results {lastEmployeeResults.length > 0 && `(${lastEmployeeResults.length})`}
        </h1>
      </div>

      {lastEmployeeResults.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(employeesByFund).map(([fundName, fundEmployees]) => (
            <EmployeeFundCard
              key={fundName}
              fundName={fundName}
              employees={fundEmployees}
              onLike={(emp) => handleEmployeeLikeDislike(emp, "like")}
              onDislike={(emp) => handleEmployeeLikeDislike(emp, "dislike")}
              isEmployeeInFavorites={(empId) => favoriteEmployees.some((fav) => fav.id === empId)}
              loadingStates={loadingStates}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center p-4">
          <UserCircle2 className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Employee Results</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Use the chat interface to search for employees. Your results will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
