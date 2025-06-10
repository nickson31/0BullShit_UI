"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompactInvestorCard from "@/components/compact-investor-card"
import EmployeeFundCard from "@/components/employee-fund-card"
import { useApp } from "@/contexts/AppContext"
import { useToast } from "@/components/ui/use-toast"
import { api, type InvestorResult, type EmployeeResult } from "@/services/api"
import { Users, UserCircle2 } from "lucide-react" // For empty states

export default function FavouritesPage() {
  const { favoriteInvestors, favoriteEmployees, loadFavorites, addToFavorites, removeFromFavorites } = useApp()
  const { toast } = useToast()
  const [investorLoadingStates, setInvestorLoadingStates] = useState<Record<string, boolean>>({})
  const [employeeLoadingStates, setEmployeeLoadingStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const handleInvestorLikeDislike = useCallback(
    async (investor: InvestorResult, action: "like" | "dislike") => {
      setInvestorLoadingStates((prev) => ({ ...prev, [investor.id]: true }))
      try {
        // Note: 'like' on favorites page usually means 'unlike' if it's already a favorite.
        // For simplicity, we'll allow "liking" again (no change) or "disliking" (removes).
        // The primary action here is removing via "dislike" or re-affirming "like".
        // If it's already a favorite, "like" does nothing to sentiment API, "dislike" removes.
        // If somehow it's not (e.g. state issue), "like" adds, "dislike" does nothing to sentiment.

        if (action === "dislike") {
          await api.updateInvestorSentiment(investor.id, "dislike")
          removeFromFavorites(investor.id, "investor")
          toast({ title: "Investor Unfavorited", description: `${investor.Company_Name} removed from favorites.` })
        } else {
          // If they click "like" on an already favorited item, we can assume they want to keep it.
          // Or, if it was somehow removed from local state but still liked on backend, this re-adds.
          await api.updateInvestorSentiment(investor.id, "like")
          addToFavorites(investor, "investor") // Ensures it's in local state
          toast({ title: "Investor Kept in Favorites", description: `${investor.Company_Name} remains in favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        setInvestorLoadingStates((prev) => ({ ...prev, [investor.id]: false }))
      }
    },
    [addToFavorites, removeFromFavorites, toast],
  )

  const handleEmployeeLikeDislike = useCallback(
    async (employee: EmployeeResult, action: "like" | "dislike") => {
      setEmployeeLoadingStates((prev) => ({ ...prev, [employee.id]: true }))
      try {
        if (action === "dislike") {
          await api.updateEmployeeSentiment(employee.id, "dislike")
          removeFromFavorites(employee.id, "employee")
          toast({ title: "Employee Unfavorited", description: `${employee.fullName} removed from favorites.` })
        } else {
          await api.updateEmployeeSentiment(employee.id, "like")
          addToFavorites(employee, "employee")
          toast({ title: "Employee Kept in Favorites", description: `${employee.fullName} remains in favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update employee status.", variant: "destructive" })
      } finally {
        setEmployeeLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
      }
    },
    [addToFavorites, removeFromFavorites, toast],
  )

  const favoriteEmployeesByFund = useMemo(() => {
    return favoriteEmployees.reduce(
      (acc, emp) => {
        const company = emp.current_company_name || "Unknown Company"
        if (!acc[company]) acc[company] = []
        acc[company].push(emp)
        return acc
      },
      {} as Record<string, EmployeeResult[]>,
    )
  }, [favoriteEmployees])

  return (
    <div className="container py-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>

      <Tabs defaultValue="investors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="investors">Saved Investors ({favoriteInvestors.length})</TabsTrigger>
          <TabsTrigger value="employees">Saved Employees ({favoriteEmployees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="investors">
          {favoriteInvestors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteInvestors.map((investor) => (
                <CompactInvestorCard
                  key={investor.id}
                  investor={investor}
                  onLike={() => handleInvestorLikeDislike(investor, "like")}
                  onDislike={() => handleInvestorLikeDislike(investor, "dislike")}
                  isFavorite={true} // All items on this page are favorites
                  isLoading={investorLoadingStates[investor.id] || false}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center p-4">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Favorite Investors</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Like investors from search results to add them here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="employees">
          {favoriteEmployees.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(favoriteEmployeesByFund).map(([fundName, employeesInFund]) => (
                <EmployeeFundCard
                  key={fundName}
                  fundName={fundName}
                  employees={employeesInFund}
                  onLike={(emp) => handleEmployeeLikeDislike(emp, "like")}
                  onDislike={(emp) => handleEmployeeLikeDislike(emp, "dislike")}
                  isEmployeeInFavorites={() => true} // All employees here are favorites
                  loadingStates={employeeLoadingStates}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center p-4">
              <UserCircle2 className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Favorite Employees</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Like employees from search results to add them here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
