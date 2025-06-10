"use client"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InvestorsResultsTable from "@/components/investors-results-table"
import EmployeesResultsTable from "@/components/employees-results-table"
import { useApp } from "@/contexts/AppContext"
import { useToast } from "@/components/ui/use-toast"

export default function FavouritesPage() {
  const { favoriteInvestors, favoriteEmployees, loadFavorites } = useApp()
  const { toast } = useToast()

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>

      <Tabs defaultValue="investors" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="investors">Saved Investors ({favoriteInvestors.length})</TabsTrigger>
          <TabsTrigger value="employees">Saved Employees ({favoriteEmployees.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="mt-6">
          {favoriteInvestors.length > 0 ? (
            <InvestorsResultsTable investors={favoriteInvestors} projectId={"p1"} showLimit={false} />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                No favorite investors yet. Like investors from search results to add them here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          {favoriteEmployees.length > 0 ? (
            <EmployeesResultsTable employees={favoriteEmployees} projectId={"p1"} showLimit={false} />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                No favorite employees yet. Like employees from search results to add them here.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
