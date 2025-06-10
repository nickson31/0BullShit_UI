"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { Employee } from "@/types/supabase"
import type { InvestorResult, EmployeeResult } from "@/services/api"
import { employeeService } from "@/services/employees"
import { api } from "@/services/api"

interface AppContextType {
  // Employee data
  employees: Employee[]
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
  searchEmployees: (query: string) => Promise<void>
  filterEmployeesByCompany: (companyName: string) => Promise<void>
  selectEmployee: (employee: Employee | null) => void
  updateEmployeeScore: (id: string, score: number) => Promise<void>
  loadAllEmployees: () => Promise<void>

  // Chat search results
  lastInvestorResults: InvestorResult[]
  lastEmployeeResults: EmployeeResult[]
  lastDeepAnalysis: string | null
  setLastInvestorResults: (results: InvestorResult[]) => void
  setLastEmployeeResults: (results: EmployeeResult[]) => void
  setLastDeepAnalysis: (analysis: string | null) => void

  // Favorites
  favoriteInvestors: InvestorResult[]
  favoriteEmployees: EmployeeResult[]
  addToFavorites: (item: InvestorResult | EmployeeResult, type: "investor" | "employee") => void
  removeFromFavorites: (id: string, type: "investor" | "employee") => void
  loadFavorites: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Chat search results
  const [lastInvestorResults, setLastInvestorResults] = useState<InvestorResult[]>([])
  const [lastEmployeeResults, setLastEmployeeResults] = useState<EmployeeResult[]>([])
  const [lastDeepAnalysis, setLastDeepAnalysis] = useState<string | null>(null)

  // Favorites
  const [favoriteInvestors, setFavoriteInvestors] = useState<InvestorResult[]>([])
  const [favoriteEmployees, setFavoriteEmployees] = useState<EmployeeResult[]>([])

  const loadAllEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeService.getAll()
      setEmployees(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load employees"
      console.error("AppContext loadAllEmployees error:", errorMessage)
      setError(errorMessage)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [])

  const searchEmployees = useCallback(async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedEmployee(null)
      const data = await employeeService.search(query)
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search employees")
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [])

  const filterEmployeesByCompany = useCallback(async (companyName: string) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedEmployee(null)
      const data = await employeeService.searchByCompany(companyName)
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter employees by company")
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEmployeeScore = useCallback(
    async (id: string, score: number) => {
      try {
        await employeeService.updateDecisionScore(id, score)
        setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, decision_score: score } : emp)))
        if (selectedEmployee && selectedEmployee.id === id) {
          setSelectedEmployee((prev) => (prev ? { ...prev, decision_score: score } : null))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update score")
      }
    },
    [selectedEmployee],
  )

  const addToFavorites = useCallback((item: InvestorResult | EmployeeResult, type: "investor" | "employee") => {
    if (type === "investor") {
      setFavoriteInvestors((prev) => {
        const exists = prev.find((inv) => inv.id === item.id)
        if (!exists) {
          return [...prev, item as InvestorResult]
        }
        return prev
      })
    } else {
      setFavoriteEmployees((prev) => {
        const exists = prev.find((emp) => emp.id === item.id)
        if (!exists) {
          return [...prev, item as EmployeeResult]
        }
        return prev
      })
    }
  }, [])

  const removeFromFavorites = useCallback((id: string, type: "investor" | "employee") => {
    if (type === "investor") {
      setFavoriteInvestors((prev) => prev.filter((inv) => inv.id !== id))
    } else {
      setFavoriteEmployees((prev) => prev.filter((emp) => emp.id !== id))
    }
  }, [])

  const loadFavorites = useCallback(async () => {
    try {
      const [investors, employees] = await Promise.all([api.getSavedInvestors(), api.getSavedEmployees()])
      setFavoriteInvestors(Array.isArray(investors) ? investors : [])
      setFavoriteEmployees(Array.isArray(employees) ? employees : [])
    } catch (error) {
      console.error("Failed to load favorites:", error)
      // Establecer arrays vacíos en caso de error
      setFavoriteInvestors([])
      setFavoriteEmployees([])
    }
  }, [])

  useEffect(() => {
    loadAllEmployees()
    loadFavorites()
  }, [loadAllEmployees, loadFavorites])

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
    lastInvestorResults,
    lastEmployeeResults,
    lastDeepAnalysis,
    setLastInvestorResults,
    setLastEmployeeResults,
    setLastDeepAnalysis,
    favoriteInvestors,
    favoriteEmployees,
    addToFavorites,
    removeFromFavorites,
    loadFavorites,
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
