"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/contexts/AppContext"
import { api, type EmployeeResult } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Users, UserCircle2, Heart, X, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import CompactInvestorCard from "@/components/compact-investor-card" // Assuming this is the correct path

// Re-defining EmployeeFundCard locally for Favourites page specific needs
// or ensure the shared one can handle this new "Generate Template" button per employee
interface EmployeeCardProps {
  employee: EmployeeResult
  onToggleFavorite: (employee: EmployeeResult) => void
  onDislikeAction: (employee: EmployeeResult) => void
  onGenerateTemplate: (employee: EmployeeResult) => void
  isFavorite: boolean
  isLoading: boolean
}

function FavoriteEmployeeCard({
  employee,
  onToggleFavorite,
  onDislikeAction,
  onGenerateTemplate,
  isFavorite,
  isLoading,
}: EmployeeCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border-t hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={employee.profilePic || "/placeholder.svg?width=32&height=32&query=user+avatar"}
            alt={employee.fullName}
          />
          <AvatarFallback>{employee.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{employee.fullName}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {employee.current_job_title || employee.headline}
          </p>
        </div>
      </div>
      <div className="flex gap-1 items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(employee)
          }}
          disabled={isLoading}
          className={cn(
            "h-7 w-7 p-0 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900",
            isFavorite ? "text-pink-500" : "text-slate-500 dark:text-slate-400",
          )}
          title={isFavorite ? "Unlike Employee" : "Like Employee"}
        >
          <Heart className={cn("h-4 w-4", isFavorite ? "fill-pink-500" : "")} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDislikeAction(employee)
          }}
          disabled={isLoading}
          className="h-7 w-7 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Dislike Employee"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerateTemplate(employee)}
          className="h-7 px-2 py-1 text-xs"
          title="Generate Template"
        >
          <FileText className="h-3 w-3 sm:mr-1" />
          <span className="hidden sm:inline">Template</span>
        </Button>
      </div>
    </div>
  )
}

interface FavoriteEmployeeFundCardProps {
  fundName: string
  employees: EmployeeResult[]
  onToggleFavorite: (employee: EmployeeResult) => void
  onDislikeAction: (employee: EmployeeResult) => void
  onGenerateTemplate: (employee: EmployeeResult) => void
  isEmployeeFavorite: (employeeId: string) => boolean
  loadingStates: Record<string, boolean>
}

function FavoriteEmployeeFundCard({
  fundName,
  employees,
  onToggleFavorite,
  onDislikeAction,
  onGenerateTemplate,
  isEmployeeFavorite,
  loadingStates,
}: FavoriteEmployeeFundCardProps) {
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded on Favourites page

  return (
    <Card className="w-full mb-4">
      <CardHeader
        className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-base font-medium">{fundName}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {employees.length} saved
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 px-0">
              <div className="max-h-[400px] overflow-y-auto">
                {employees.map((employee) => (
                  <FavoriteEmployeeCard
                    key={employee.id}
                    employee={employee}
                    onToggleFavorite={onToggleFavorite}
                    onDislikeAction={onDislikeAction}
                    onGenerateTemplate={onGenerateTemplate}
                    isFavorite={isEmployeeFavorite(employee.id)}
                    isLoading={loadingStates[employee.id] || false}
                  />
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default function FavouritesPage() {
  const {
    favoriteInvestors,
    favoriteEmployees,
    loadFavorites,
    addToFavorites, // Make sure these are correctly imported if used directly
    removeFromFavorites, // Make sure these are correctly imported if used directly
  } = useApp()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await loadFavorites()
      setIsLoading(false)
    }
    fetchData()
  }, [loadFavorites])

  const handleInvestorToggleFavorite = useCallback(
    async (investorId: string) => {
      setActionLoadingStates((prev) => ({ ...prev, [investorId]: true }))
      const investor = favoriteInvestors.find((inv) => inv.id === investorId)
      if (!investor) return

      const currentIsFavorite = favoriteInvestors.some((fav) => fav.id === investorId) // Should always be true here

      try {
        if (currentIsFavorite) {
          await api.updateInvestorSentiment(investorId, "dislike") // To remove from favorites
          removeFromFavorites(investorId, "investor")
          toast({ title: "Investor Unliked", description: `${investor.Company_Name} removed from favorites.` })
        } else {
          // This case should ideally not be hit if only favorites are shown and toggle means unlike
          await api.updateInvestorSentiment(investorId, "like")
          addToFavorites(investor, "investor")
          toast({ title: "Investor Liked", description: `${investor.Company_Name} added to favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
      }
    },
    [favoriteInvestors, addToFavorites, removeFromFavorites, toast],
  )

  const handleInvestorDislikeAction = useCallback(
    async (investorId: string) => {
      setActionLoadingStates((prev) => ({ ...prev, [investorId]: true }))
      const investor = favoriteInvestors.find((inv) => inv.id === investorId)
      if (!investor) return

      try {
        await api.updateInvestorSentiment(investorId, "dislike")
        removeFromFavorites(investorId, "investor")
        toast({
          title: "Investor Disliked",
          description: `${investor.Company_Name} marked as disliked and removed from favorites.`,
        })
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
      }
    },
    [favoriteInvestors, removeFromFavorites, toast],
  )

  const handleEmployeeToggleFavorite = useCallback(
    async (employee: EmployeeResult) => {
      setActionLoadingStates((prev) => ({ ...prev, [employee.id]: true }))
      const currentIsFavorite = favoriteEmployees.some((fav) => fav.id === employee.id) // Should be true

      try {
        if (currentIsFavorite) {
          await api.updateEmployeeSentiment(employee.id, "dislike")
          removeFromFavorites(employee.id, "employee")
          toast({ title: "Employee Unliked", description: `${employee.fullName} removed from favorites.` })
        } else {
          await api.updateEmployeeSentiment(employee.id, "like")
          addToFavorites(employee, "employee")
          toast({ title: "Employee Liked", description: `${employee.fullName} added to favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update employee status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
      }
    },
    [favoriteEmployees, addToFavorites, removeFromFavorites, toast],
  )

  const handleEmployeeDislikeAction = useCallback(
    async (employee: EmployeeResult) => {
      setActionLoadingStates((prev) => ({ ...prev, [employee.id]: true }))
      try {
        await api.updateEmployeeSentiment(employee.id, "dislike")
        removeFromFavorites(employee.id, "employee")
        toast({
          title: "Employee Disliked",
          description: `${employee.fullName} marked as disliked and removed from favorites.`,
        })
      } catch (error) {
        toast({ title: "Error", description: "Failed to update employee status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
      }
    },
    [favoriteEmployees, removeFromFavorites, toast],
  )

  const handleGenerateTemplate = (entityId: string, entityType: "investor" | "employee") => {
    router.push(`/templates?entityId=${entityId}&entityType=${entityType}`)
  }

  const employeesByFund = favoriteEmployees.reduce(
    (acc, emp) => {
      const company = emp.current_company_name || "Unknown Fund"
      if (!acc[company]) acc[company] = []
      acc[company].push(emp)
      return acc
    },
    {} as Record<string, EmployeeResult[]>,
  )

  if (isLoading) {
    return (
      <div className="container py-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Favourites</h1>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Favourites</h1>

      {favoriteInvestors.length === 0 && Object.keys(employeesByFund).length === 0 && (
        <div className="flex flex-col items-center justify-center h-60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center p-4">
          <Heart className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Favourites Yet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Like investors or employees from your searches to see them here.
          </p>
        </div>
      )}

      {favoriteInvestors.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-500" />
            Favourite Investors ({favoriteInvestors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteInvestors.map((investor) => (
              <div key={investor.id} className="flex flex-col">
                <CompactInvestorCard
                  investor={investor}
                  onToggleFavorite={() => handleInvestorToggleFavorite(investor.id)}
                  onDislikeAction={() => handleInvestorDislikeAction(investor.id)}
                  isFavorite={true} // It's a favorite on this page
                  isLoading={actionLoadingStates[investor.id] || false}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handleGenerateTemplate(investor.id, "investor")}
                >
                  <FileText className="mr-2 h-4 w-4" /> Generate Template
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(employeesByFund).length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserCircle2 className="mr-2 h-5 w-5 text-green-500" />
            Favourite Employees ({favoriteEmployees.length})
          </h2>
          <div className="space-y-4">
            {Object.entries(employeesByFund).map(([fundName, employeesInFund]) => (
              <FavoriteEmployeeFundCard
                key={fundName}
                fundName={fundName}
                employees={employeesInFund}
                onToggleFavorite={handleEmployeeToggleFavorite}
                onDislikeAction={handleEmployeeDislikeAction}
                onGenerateTemplate={(employee) => handleGenerateTemplate(employee.id, "employee")}
                isEmployeeFavorite={(empId) => favoriteEmployees.some((fav) => fav.id === empId)}
                loadingStates={actionLoadingStates}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
