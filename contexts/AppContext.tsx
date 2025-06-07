import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type Employee } from '@/types/supabase'
import { employeeService } from '@/services/employees'

interface AppContextType {
  employees: Employee[]
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
  searchEmployees: (query: string) => Promise<void>
  selectEmployee: (employee: Employee | null) => void
  updateEmployeeScore: (id: string, score: number) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    try {
      setLoading(true)
      const data = await employeeService.getAll()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  async function searchEmployees(query: string) {
    try {
      setLoading(true)
      const data = await employeeService.search(query)
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search employees')
    } finally {
      setLoading(false)
    }
  }

  async function updateEmployeeScore(id: string, score: number) {
    try {
      await employeeService.updateDecisionScore(id, score)
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, decision_score: score } : emp
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update score')
    }
  }

  const value = {
    employees,
    selectedEmployee,
    loading,
    error,
    searchEmployees,
    selectEmployee: setSelectedEmployee,
    updateEmployeeScore
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
} 