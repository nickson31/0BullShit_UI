import { supabase } from '@/lib/supabase'
import { type Employee } from '@/types/supabase'

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('decision_score', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async search(query: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .or(`fullName.ilike.%${query}%,current_company_name.ilike.%${query}%,current_job_title.ilike.%${query}%`)
      .order('decision_score', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async updateDecisionScore(id: string, score: number): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ decision_score: score })
      .eq('id', id)
    
    if (error) throw error
  }
} 