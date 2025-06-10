// Define the base URL for your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://zerobs-back-final.onrender.com"

interface ChatRequest {
  message: string
}

// More specific types for ChatResponse based on app.py
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

interface OutreachTemplate {
  template_id: string
  content: string
  platform: string
  target_entity_type: string
  target_info: Record<string, any>
}

export type ChatResponseType =
  | { type: "onboarding_question"; content: string }
  | { type: "plan_upsell"; content: string; plan: string; price: string }
  | { type: "plan_confirmed"; content: string }
  | { type: "investor_results"; content: InvestorResult[]; message?: string }
  | { type: "sentiment_saved"; content: string }
  | { type: "outreach_template"; content: OutreachTemplate; message?: string }
  | { type: "outreach_activated"; content: string; next_steps?: string[] }
  | { type: "text_response"; content: string }
  | { type: "error"; content: string }

// Helper function to handle API requests
async function fetchApi(endpoint: string, options: RequestInit = {}) {
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
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.detail || errorData.error || errorMessage
    } catch (e) {
      // Ignore if error response is not JSON
    }
    throw new Error(errorMessage)
  }
  return response.json()
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
    return fetchApi("/saved/investors")
  },

  async saveInvestor(investorId: string): Promise<{ message: string }> {
    return fetchApi("/save/investor", {
      method: "POST",
      body: JSON.stringify({ investor_id: investorId }),
    })
  },

  async updateInvestorSentiment(entityId: string, sentiment: "like" | "dislike"): Promise<{ message: string }> {
    return fetchApi("/sentiment", {
      method: "POST",
      body: JSON.stringify({
        entity_id: entityId,
        entity_type: "investor",
        sentiment,
      }),
    })
  },

  // Employee endpoints
  async searchEmployees(query: string): Promise<any[]> {
    return fetchApi("/search/employees", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  },

  async getSavedEmployees(): Promise<any[]> {
    return fetchApi("/saved/employees")
  },

  async saveEmployee(employeeId: string): Promise<{ message: string }> {
    return fetchApi("/save/employee", {
      method: "POST",
      body: JSON.stringify({ employee_id: employeeId }),
    })
  },

  async updateEmployeeSentiment(entityId: string, sentiment: "like" | "dislike"): Promise<{ message: string }> {
    return fetchApi("/sentiment", {
      method: "POST",
      body: JSON.stringify({
        entity_id: entityId,
        entity_type: "employee",
        sentiment,
      }),
    })
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

export type { InvestorResult }
