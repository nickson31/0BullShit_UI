"use client"

import type React from "react"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation" // Corrected import
import EmployeeList from "@/components/employees/EmployeeList"
import EmployeeDetail from "@/components/employees/EmployeeDetail"
import { Input } from "@/components/ui/input"
import { useApp } from "@/contexts/AppContext"

export default function EmployeesPage() {
  const { searchEmployees, filterEmployeesByCompany } = useApp() // Added filterEmployeesByCompany
  const searchParams = useSearchParams()
  const router = useRouter() // Declared router variable
  const companyFilter = searchParams.get("company")

  useEffect(() => {
    if (companyFilter) {
      filterEmployeesByCompany(companyFilter)
    } else {
      // Optional: load all or clear filter if no company is specified
      // searchEmployees(''); // Or a dedicated function to load all/clear
    }
  }, [companyFilter, filterEmployeesByCompany])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // If user types in search, it overrides company filter for this action
    if (companyFilter && e.target.value) {
      // Potentially clear company filter or let search take precedence
      // For now, search will override
      router.push("/employees") // Clear company query param
    }
    searchEmployees(e.target.value)
  }

  return (
    <div className="flex h-full">
      <div className="w-1/2 border-r dark:border-slate-700">
        <div className="p-4 border-b dark:border-slate-700">
          <Input
            placeholder={
              companyFilter ? `Employees at ${companyFilter} (clear search to see all)` : "Search employees..."
            }
            onChange={handleSearchInputChange}
            // defaultValue={companyFilter ? "" : undefined} // Clear input if company filter active
          />
        </div>
        <EmployeeList />
      </div>
      <div className="w-1/2">
        <EmployeeDetail />
      </div>
    </div>
  )
}
