import { supabase } from "@/lib/supabase"
import type { Employee } from "@/types/supabase"

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("decision_score", { ascending: false, nullsFirst: false }) // Keep nulls at the end or beginning
      .limit(100) // Add a limit for performance

    if (error) {
      console.error("Error fetching all employees:", error)
      throw error
    }
    return data || []
  },

  async getById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase.from("employees").select("*").eq("id", id).single()

    if (error) {
      console.error(`Error fetching employee by ID ${id}:`, error)
      throw error
    }
    return data
  },

  async search(query: string): Promise<Employee[]> {
    if (!query.trim()) {
      // If query is empty, return all or a subset
      return this.getAll()
    }
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      // Ensure column names match your Supabase table exactly
      .or(`fullName.ilike.%${query}%,current_company_name.ilike.%${query}%,current_job_title.ilike.%${query}%`)
      .order("decision_score", { ascending: false, nullsFirst: false })
      .limit(50) // Limit search results

    if (error) {
      console.error("Error searching employees:", error)
      throw error
    }
    return data || []
  },

  // New function to search by company name
  async searchByCompany(companyName: string): Promise<Employee[]> {
    if (!companyName.trim()) {
      return [] // Or return all if that's desired for empty company filter
    }
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .ilike("current_company_name", `%${companyName}%`) // Case-insensitive search for company name
      .order("decision_score", { ascending: false, nullsFirst: false })
      .limit(50)

    if (error) {
      console.error(`Error searching employees by company ${companyName}:`, error)
      throw error
    }
    return data || []
  },

  async updateDecisionScore(id: string, score: number): Promise<void> {
    const { error } = await supabase.from("employees").update({ decision_score: score }).eq("id", id)

    if (error) {
      console.error(`Error updating decision score for employee ${id}:`, error)
      throw error
    }
  },
}
