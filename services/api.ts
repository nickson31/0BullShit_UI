// Define the base URL for your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://zerobs-back-final.onrender.com"

interface ChatRequest {
  message: string
}

// Updated types based on your backend response types
export interface InvestorResult {
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

export interface EmployeeResult {
  id: string
  fullName: string
  headline: string
  current_job_title: string
  current_company_name?: string // Added for grouping
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

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`
      try {
        const errorData = await response.text()
        try {
          const jsonError = JSON.parse(errorData)
          errorMessage = jsonError.message || jsonError.detail || jsonError.error || errorMessage
        } catch {
          errorMessage = errorData || errorMessage
        }
      } catch (e) {
        console.error(`Failed to read error response from ${endpoint}:`, e)
      }
      throw new Error(errorMessage)
    }

    const responseText = await response.text()
    if (!responseText) {
      return {}
    }
    try {
      return JSON.parse(responseText)
    } catch (e) {
      return { message: responseText }
    }
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error)
    throw error
  }
}

export const api = {
  /**
   * The single entry point for all conversational searches and actions.
   */
  async chat(request: ChatRequest): Promise<ChatResponseType> {
    return fetchApi("/chat", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  // NOTE: All other direct API calls for search have been removed as per user request.
  // The app should now use the chat() method for all search-related functionality.
  // Sentiment and save/get actions remain for now for specific UI interactions (like/dislike, favorites page).

  async getSavedInvestors(): Promise<any[]> {
    try {
      const result = await fetchApi("/saved/investors")
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.error("Failed to get saved investors:", error)
      return []
    }
  },

  async updateInvestorSentiment(entityId: string, sentiment: "like" | "dislike"): Promise<{ message: string }> {
    return fetchApi("/sentiment", {
      method: "POST",
      body: JSON.stringify({ entity_id: entityId, entity_type: "investor", sentiment }),
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

  async updateEmployeeSentiment(entityId: string, sentiment: "like" | "dislike"): Promise<{ message: string }> {
    return fetchApi("/sentiment", {
      method: "POST",
      body: JSON.stringify({ entity_id: entityId, entity_type: "employee", sentiment }),
    })
  },
}
