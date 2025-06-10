"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Employee } from "@/types/supabase" // Assuming this type is correct for your Supabase 'employees' table
import { employeeService } from "@/services/employees"
import { useToast } from "@/components/ui/use-toast"

interface AppContextType {
  employees: Employee[]
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
  searchEmployees: (query: string) => Promise<void>
  filterEmployeesByCompany: (companyName: string) => Promise<void> // New function
  selectEmployee: (employee: Employee | null) => void
  updateEmployeeScore: (id: string, score: number) => Promise<void>
  loadAllEmployees: () => Promise<void> // To load all employees
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<"all" | "search" | "company">("all")
  const [currentSearchQuery, setCurrentSearchQuery] = useState("")
  const [currentCompanyFilter, setCurrentCompanyFilter] = useState("")
  const { toast } = useToast()

  const loadAllEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeService.getAll()
      setEmployees(data)
      setCurrentFilter("all")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees")
      toast({
        title: "Error",
        description: "Failed to load employees. Please try again.",
        variant: "destructive",
      })
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadAllEmployees()
  }, [loadAllEmployees])

  const searchEmployees = useCallback(
    async (query: string) => {
      try {
        setLoading(true)
        setError(null)
        setSelectedEmployee(null) // Clear selection on new search

        // Simulate AI thinking for employee search (5-8 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 3000))

        const data = await employeeService.search(query)
        setEmployees(data)
        setCurrentFilter("search")
        setCurrentSearchQuery(query)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search employees")
        toast({
          title: "Error",
          description: "Failed to search employees. Please try again.",
          variant: "destructive",
        })
        setEmployees([])
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const filterEmployeesByCompany = useCallback(
    async (companyName: string) => {
      try {
        setLoading(true)
        setError(null)
        setSelectedEmployee(null) // Clear selection on new filter

        // Simulate AI thinking for employee search (5-8 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5000 + Math.random() * 3000))

        const data = await employeeService.searchByCompany(companyName) // Assumes searchByCompany exists
        setEmployees(data)
        setCurrentFilter("company")
        setCurrentCompanyFilter(companyName)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to filter employees by company")
        toast({
          title: "Error",
          description: "Failed to filter employees by company. Please try again.",
          variant: "destructive",
        })
        setEmployees([])
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateEmployeeScore = useCallback(
    async (id: string, score: number) => {
      try {
        await employeeService.updateDecisionScore(id, score)
        setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, decision_score: score } : emp)))
        if (selectedEmployee && selectedEmployee.id === id) {
          setSelectedEmployee((prev) => (prev ? { ...prev, decision_score: score } : null))
        }
        toast({
          title: "Score Updated",
          description: "Employee decision score has been updated successfully.",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update score")
        toast({
          title: "Error",
          description: "Failed to update employee score. Please try again.",
          variant: "destructive",
        })
      }
    },
    [selectedEmployee, toast],
  )

  const value = {
    employees,
    selectedEmployee,
    loading,
    error,
    searchEmployees,
    filterEmployeesByCompany,
    selectEmployee: setSelectedEmployee,
    updateEmployeeScore,
    loadAllEmployees,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
