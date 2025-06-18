// Define the base URL for your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://zerobs-back-final.onrender.com"

// --- Request & Response Types ---

// Auth
export interface LoginRequest {
  email: string
  password: string
}
export interface LoginResponse {
  message: string
  token: string
  user: UserProfile
  error?: string
}

// User & Project
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  subscription_plan: "free" | "growth" | "pro"
  credits: number
  created_at: string
}
export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}
export interface ProfileResponse {
  user: UserProfile
  projects: Project[]
}

// Chat
export interface ChatRequest {
  message: string
  project_id: string
}

// Generic search result types from previous version
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
  current_company_name?: string
  location: string
  linkedinUrl: string
  email: string
  profilePic?: string
}

// This should be updated to reflect the 60-bot system's potential responses
export type ChatResponseType =
  | { type: "investor_results_normal"; search_results: { results: InvestorResult[] } }
  | { type: "investor_results_deep"; search_results: { results: InvestorResult[]; deep_analysis: string } }
  | {
      type: "employee_results"
      search_results: { employees: EmployeeResult[]; employees_by_fund?: Record<string, EmployeeResult[]> }
    }
  | { type: "text_response"; content: string }
  | { type: "document_generated"; document_id: string; document_title: string; message: string }
  | { type: "error"; content: string }

// --- API Helper ---

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  const headers = new Headers(options.headers || {})
  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (e) {
        // Response was not JSON
      }
      throw new Error(errorMessage)
    }

    // Handle empty response body
    const responseText = await response.text()
    return responseText ? JSON.parse(responseText) : {}
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error)
    throw error
  }
}

// --- API Methods ---

export const api = {
  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    return fetchApi("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // User & Projects
  async getProfile(): Promise<ProfileResponse> {
    // This endpoint should be created on the backend to return user + projects
    // For now, we simulate it by calling two endpoints.
    // A better backend would have a single `/profile` endpoint.
    const user = await fetchApi("/user/profile")
    // Assuming a /projects endpoint exists, which is a reasonable expectation.
    // If not, this part needs to be adapted.
    const projects = await fetchApi("/projects") // Assuming this endpoint returns Project[]
    return { user, projects }
  },

  async getCreditBalance(): Promise<{ credits: number }> {
    return fetchApi("/credits/balance")
  },

  // Main Chat
  async chat(request: ChatRequest): Promise<ChatResponseType> {
    // The backend route from app.py is /chat/bot
    // It is not project-scoped, so we send project_id in the body.
    return fetchApi("/chat/bot", {
      method: "POST",
      body: JSON.stringify({
        message: request.message,
        context: { project_id: request.project_id }, // Sending project_id in context
      }),
    })
  },
}
