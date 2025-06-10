"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { InvestorResult, EmployeeResult } from "@/services/api"
import { api } from "@/services/api"

interface AppContextType {
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
  // Chat search results state
  const [lastInvestorResults, setLastInvestorResults] = useState<InvestorResult[]>([])
  const [lastEmployeeResults, setLastEmployeeResults] = useState<EmployeeResult[]>([])
  const [lastDeepAnalysis, setLastDeepAnalysis] = useState<string | null>(null)

  // Favorites state
  const [favoriteInvestors, setFavoriteInvestors] = useState<InvestorResult[]>([])
  const [favoriteEmployees, setFavoriteEmployees] = useState<EmployeeResult[]>([])

  const addToFavorites = useCallback((item: InvestorResult | EmployeeResult, type: "investor" | "employee") => {
    if (type === "investor") {
      setFavoriteInvestors((prev) => {
        if (!prev.some((inv) => inv.id === item.id)) {
          return [...prev, item as InvestorResult]
        }
        return prev
      })
    } else {
      setFavoriteEmployees((prev) => {
        if (!prev.some((emp) => emp.id === item.id)) {
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
      setFavoriteInvestors([])
      setFavoriteEmployees([])
    }
  }, [])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const value = {
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
