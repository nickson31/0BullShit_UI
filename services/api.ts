// Define the base URL for your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://zerobs-back-final.onrender.com"

interface ChatRequest {
  project_id: string
  message: string
  deep_research?: boolean
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

interface ProjectData {
  id: string
  user_id: string
  project_name: string
  project_description: string
  kpi_data: Record<string, any>
  status: string
  plan?: string // Added from app.py
}

interface ProjectResponse {
  project: ProjectData
  chat_history: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  saved_investors_count: number
  user_plan: string
}

interface SavedInvestor extends InvestorResult {
  added_at: string
  sentiment: "like" | "dislike" | null
}

interface SavedInvestorsResponse {
  saved_investors: SavedInvestor[]
}

interface GeneratedTemplate {
  id: string
  target_investor_id: string
  platform: string
  generated_template: string
  created_at: string
  target_name: string
}

interface ProjectTemplatesResponse {
  templates: GeneratedTemplate[]
}

// Helper function to handle API requests
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
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

  async getProject(projectId: string): Promise<ProjectResponse> {
    return fetchApi(`/projects/${projectId}`)
  },

  async updateProjectStatus(projectId: string, status: string): Promise<{ message: string }> {
    return fetchApi(`/projects/${projectId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },

  async updateProjectKPI(projectId: string, kpiData: Record<string, any>): Promise<{ message: string }> {
    return fetchApi(`/projects/${projectId}/kpi`, {
      method: "PUT",
      body: JSON.stringify({ kpi_data: kpiData }),
    })
  },

  async getSavedInvestors(projectId: string): Promise<SavedInvestorsResponse> {
    return fetchApi(`/projects/${projectId}/saved-investors`)
  },

  async findInvestors(query: string, deep_research = false): Promise<InvestorResult[] | { error: string }> {
    // The legacy endpoint in app.py takes 'query' and 'deep_research'
    return fetchApi("/find_investors", {
      method: "POST",
      body: JSON.stringify({ query, deep_research }),
    })
  },

  async getProjectTemplates(projectId: string): Promise<ProjectTemplatesResponse> {
    return fetchApi(`/projects/${projectId}/templates`)
  },

  // This function might be redundant if sentiment is handled via /chat orchestrator
  // but keeping it if direct sentiment update is needed.
  // The backend's /chat -> set_entity_sentiment handles this.
  // async updateInvestorSentiment(projectId: string, entityId: string, sentiment: "like" | "dislike"): Promise<any> {
  //   return fetchApi(`/projects/${projectId}/sentiment`, { // This endpoint doesn't exist in app.py
  //     method: "POST",
  //     body: JSON.stringify({
  //       entity_id: entityId,
  //       sentiment: sentiment,
  //     }),
  //   });
  // }
}
