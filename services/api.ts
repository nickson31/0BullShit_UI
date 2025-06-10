// Define the base URL for your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://zerobs-back-final.onrender.com"

interface ChatRequest {
  message: string
}

// Updated types based on your backend response types
interface InvestorResult {
  id: string
  Company_Name: string
  Company_Description: string
  Investing_Stage: string | string[]
  Company_Location: string
  Investment_Categories: string[]
  Company_Email?: string
  Company_Phone?: string
  Company_Linkedin?: string
  Company_Website?: string
  Score?: string
}

interface EmployeeResult {
  id: string
  fullName: string
  headline: string
  current_job_title: string
  location: string
  linkedinUrl: string
  email: string
  profilePic?: string
}

export type ChatResponseType =
  | {
      type: "investor_results_normal"
      search_results: {
        results: InvestorResult[]
      }
    }
  | {
      type: "investor_results_deep"
      search_results: {
        results: InvestorResult[]
        deep_analysis: string
      }
    }
  | {
      type: "employee_results"
      search_results: {
        employees: EmployeeResult[]
        employees_by_fund?: Record<string, EmployeeResult[]>
      }
    }
  | { type: "text_response"; content: string }
  | { type: "error"; content: string }

// Helper function to handle API requests with better error handling
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    })

    // Log the response for debugging
    console.log(`API ${endpoint} response status:`, response.status)

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`
      try {
        const errorData = await response.text() // Use text() first to see raw response
        console.log(`API ${endpoint} error response:`, errorData)

        // Try to parse as JSON
        try {
          const jsonError = JSON.parse(errorData)
          errorMessage = jsonError.message || jsonError.detail || jsonError.error || errorMessage
        } catch {
          // If not JSON, use the text as error message
          errorMessage = errorData || errorMessage
        }
      } catch (e) {
        console.error(`Failed to read error response from ${endpoint}:`, e)
      }
      throw new Error(errorMessage)
    }

    // Try to parse response as JSON
    const responseText = await response.text()
    if (!responseText) {
      return {} // Return empty object for empty responses
    }

    try {
      return JSON.parse(responseText)
    } catch (e) {
      console.warn(`Response from ${endpoint} is not valid JSON:`, responseText)
      return { message: responseText } // Return as message if not JSON
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error)
    throw error
  }
}

export const api = {
  async chat(request: ChatRequest): Promise<ChatResponseType> {
    return fetchApi("/chat", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  async getSessionInfo(): Promise<any> {
    return fetchApi("/session/info")
  },

  // Investor endpoints
  async searchInvestors(query: string, type: "normal" | "deep" = "normal"): Promise<InvestorResult[]> {
    return fetchApi("/search/investors", {
      method: "POST",
      body: JSON.stringify({ query, type }),
    })
  },

  async getSavedInvestors(): Promise<any[]> {
    try {
      const result = await fetchApi("/saved/investors")
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error("Failed to get saved investors:", error)
      return []
    }
  },

  async saveInvestor(investorId: string): Promise<{ message: string }> {
    try {
      console.log(`Attempting to save investor: ${investorId}`)

      const result = await fetchApi("/save/investor", {
        method: "POST",
        body: JSON.stringify({ investor_id: investorId }),
      })

      console.log(`Successfully saved investor ${investorId}:`, result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`Failed to save investor ${investorId}:`, errorMessage)

      // Don't throw error, just return a failure message
      return { message: `Failed to save: ${errorMessage}` }
    }
  },

  async updateInvestorSentiment(entityId: string, sentiment: "like" | "dislike"): Promise<{ message: string }> {
    try {
      return await fetchApi("/sentiment", {
        method: "POST",
        body: JSON.stringify({
          entity_id: entityId,
          entity_type: "investor",
          sentiment,
        }),
      })
    } catch (error) {
      console.error(`Failed to update investor sentiment ${entityId}:`, error)
      throw error
    }
  },

  // Employee endpoints
  async searchEmployees(query: string): Promise<any[]> {
    return fetchApi("/search/employees", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  },

  async getSavedEmployees(): Promise<any[]> {
    try {
      const result = await fetchApi("/saved/employees")
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error("Failed to get saved employees:", error)
      return []
    }
  },

  async saveEmployee(employeeId: string): Promise<{ message: string }> {
    try {
      console.log(`Attempting to save employee: ${employeeId}`)

      const result = await fetchApi("/save/employee", {
        method: "POST",
        body: JSON.stringify({ employee_id: employeeId }),
      })

      console.log(`Successfully saved employee ${employeeId}:`, result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`Failed to save employee ${employeeId}:`, errorMessage)

      // Don't throw error, just return a failure message
      return { message: `Failed to save: ${errorMessage}` }
    }
  },

  async updateEmployeeSentiment(entityId: string, sentiment: "like" | "dislike"): Promise<{ message: string }> {
    try {
      return await fetchApi("/sentiment", {
        method: "POST",
        body: JSON.stringify({
          entity_id: entityId,
          entity_type: "employee",
          sentiment,
        }),
      })
    } catch (error) {
      console.error(`Failed to update employee sentiment ${entityId}:`, error)
      throw error
    }
  },

  // Template generation
  async generateTemplate(data: any): Promise<any> {
    return fetchApi("/generate/template", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Legacy methods for compatibility
  async findInvestors(query: string, deep_research = false): Promise<InvestorResult[]> {
    return this.searchInvestors(query, deep_research ? "deep" : "normal")
  },

  async getSavedItems(projectId: string, type: "investors" | "employees"): Promise<any[]> {
    if (type === "investors") {
      return this.getSavedInvestors()
    } else {
      return this.getSavedEmployees()
    }
  },

  async getUnwantedItems(projectId: string): Promise<any[]> {
    // This might need a specific endpoint or could be handled through session info
    return []
  },

  async removeSentiment(sentimentId: string): Promise<{ message: string }> {
    // This might need a specific endpoint for removing sentiments
    throw new Error("Remove sentiment endpoint not implemented")
  },
}

export type { InvestorResult, EmployeeResult }
