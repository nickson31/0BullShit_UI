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
  token?: string // Make token optional as it might not be present on error
  user?: UserProfile // Make user optional as it might not be present on error
  error?: string
  success?: boolean // Added for consistency with backend responses
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

// Project Creation
export interface CreateProjectRequest {
  name: string
  description?: string // Optional description
}

// Investor Search
export interface InvestorSearchRequest {
  query: string
  project_id: string
  filters?: {
    locations?: string[]
    stages?: string[]
    categories?: string[]
  }
  page?: number
  per_page?: number
}

export interface InvestorSearchResponse {
  results: InvestorResult[]
  total_count?: number // Assuming backend provides total count for pagination
  total_pages?: number // Assuming backend provides total pages for pagination
}

// Document Management
export interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string // Or a proper date string/object
  url?: string // URL to view/download the document
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
  | { bot: string; response: string; type: string; search_results?: any } // Added for the new backend response structure

// Define these interfaces based on your backend
export interface RegisterRequest {
  email: string
  password: string
  first_name: string // Changed from firstName to match backend
  last_name: string // Changed from lastName to match backend
}

// Assuming registration might return a similar response to login, or just a success message
export interface RegisterResponse {
  message: string
  token?: string // If backend logs in user directly after registration
  user_id?: string
  error?: string
}

export interface GoogleLoginRequest {
  token: string // This is the ID token from Google
}

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
        // Response was not JSON, or JSON parsing failed
        console.warn(
          `API response for ${endpoint} was not JSON or empty for status ${response.status}. Raw text: ${await response.text()}`,
        )
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

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return fetchApi("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async googleLogin(data: GoogleLoginRequest): Promise<LoginResponse> {
    return fetchApi("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // User & Projects
  async getProfile(): Promise<ProfileResponse> {
    const user = await fetchApi("/user/profile")
    const projects = await fetchApi("/projects")
    return { user, projects }
  },

  async getCreditBalance(): Promise<{ credits: number }> {
    return fetchApi("/credits/balance")
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    return fetchApi("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // Main Chat
  async chat(request: ChatRequest): Promise<ChatResponseType> {
    return fetchApi("/chat/bot", {
      method: "POST",
      body: JSON.stringify({
        message: request.message,
        project_id: request.project_id,
      }),
    })
  },

  // Investor Search
  async searchInvestors(request: InvestorSearchRequest): Promise<InvestorSearchResponse> {
    // This endpoint is POST /search/investors
    // The backend expects query, project_id, filters, page, per_page
    return fetchApi("/search/investors", {
      method: "POST",
      body: JSON.stringify(request),
    })
  },

  // Document Management
  async getDocuments(): Promise<Document[]> {
    // This endpoint is GET /documents
    // Mock data if backend doesn't return real documents or is not implemented
    try {
      const response = await fetchApi("/documents", { method: "GET" })
      return response.documents || [] // Assuming backend returns { documents: [...] }
    } catch (error) {
      console.warn("Failed to fetch documents from backend, returning mock data.", error)
      return [
        {
          id: "1",
          name: "Investor Pitch Deck v3.pdf",
          type: "PDF",
          size: "2.5 MB",
          uploadedAt: "2024-05-10",
          url: "#",
        },
        {
          id: "2",
          name: "Market Analysis Report.docx",
          type: "DOCX",
          size: "1.1 MB",
          uploadedAt: "2024-05-08",
          url: "#",
        },
        {
          id: "3",
          name: "Financial Projections.xlsx",
          type: "XLSX",
          size: "0.8 MB",
          uploadedAt: "2024-05-05",
          url: "#",
        },
      ]
    }
  },

  async uploadDocument(file: File, projectId: string): Promise<Document> {
    // This endpoint is not explicitly provided, so we'll simulate it.
    // In a real scenario, you'd use FormData and a POST request.
    console.log(`Simulating upload of file: ${file.name} for project: ${projectId}`)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay
    const mockDoc: Document = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.type.split("/")[1]?.toUpperCase() || "FILE",
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      url: "#", // Placeholder URL
    }
    return mockDoc
  },

  // Placeholder for other API calls not explicitly provided by backend
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    console.log(`Simulating profile update for user ${userId}:`, data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { ...data, id: userId } as UserProfile // Return updated mock profile
  },
  async getMemoryData(projectId: string): Promise<any> {
    console.log(`Simulating fetching memory data for project: ${projectId}`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      totalEntries: 125,
      lastUpdated: "2024-06-18 10:30 AM",
      memoryUsage: "75%",
      connectedSources: 5,
    }
  },
  async getOutreachCampaigns(): Promise<any[]> {
    console.log("Simulating fetching outreach campaigns")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return [] // Return mock data from page component
  },
  async getOutreachTemplates(): Promise<any[]> {
    console.log("Simulating fetching outreach templates")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return [] // Return mock data from page component
  },
  async getCreditHistory(): Promise<any[]> {
    console.log("Simulating fetching credit history")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return [] // Return mock data from page component
  },
  async getSubscriptionPlans(): Promise<any[]> {
    console.log("Simulating fetching subscription plans")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return [] // Return mock data from page component
  },
}
