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
  token?: string
  user?: UserProfile
  error?: string
  success?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}
export interface RegisterResponse {
  message: string
  token?: string
  user_id?: string
  error?: string
}

export interface GoogleLoginRequest {
  token: string // This is the access_token from Google
}

// User & Project
export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  subscription_plan: "free" | "growth" | "pro"
  credits: number
  created_at?: string // Optional, as not always present in all user objects from backend
  profile_picture_url?: string // For profile page
}
export interface Project {
  id: string
  user_id?: string // Backend might not always return this in a list
  name: string
  description: string | null
  created_at?: string
  // Fields from backend's /projects GET response
  industry?: string
  stage?: string
  location?: string
  website?: string
  is_active?: boolean
  updated_at?: string
  kpi_data?: any // JSON or string
  status?: string
  neural_memory?: any // For project detail view
}
export interface ProfileResponse {
  // For GET /user/profile
  id: string
  email: string
  first_name: string
  last_name: string
  subscription_plan: "free" | "growth" | "pro"
  credits: number
  created_at: string
}
export interface UserProjectsResponse {
  // For GET /projects
  success: boolean
  projects: Project[]
  count: number
}

// Chat
export interface ChatRequest {
  message: string
  project_id: string
  context?: any // Optional context for the bot
}

// Project Creation
export interface CreateProjectRequest {
  name: string
  description?: string
  industry?: string
  stage?: string
  location?: string
  website?: string
}
export interface CreateProjectResponse {
  success: boolean
  message: string
  project_id: string
}
export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: string
}
export interface UpdateProjectResponse {
  success: boolean
  message: string
}

// Investor Search
export interface InvestorSearchRequest {
  query: string
  project_id: string // Backend expects project_id for context, not directly for filtering
  preferences?: {
    // Backend uses 'preferences' for filters
    locations?: string[]
    stages?: string[]
    categories?: string[]
    // Add other potential filter fields based on ml_investor_search
  }
  page?: number
  per_page?: number
}
export interface InvestorResult {
  // This needs to match what ml_investor_search in app.py would return
  // Assuming a structure based on typical investor data
  id: string
  name: string // Or Company_Name
  company_name?: string
  description: string
  investing_stage: string | string[]
  location: string
  categories: string[] // Or Investment_Categories
  website?: string
  linkedin_url?: string
  email?: string
  score?: number
  // Add other fields as necessary
}
export interface InvestorSearchResponse {
  results: InvestorResult[] // Backend returns 'results'
  credits_used?: number
  // Backend doesn't explicitly state pagination fields like total_count/total_pages for this endpoint
  // We might need to handle pagination client-side or assume a limited set of results
}

// Document Management
export interface Document {
  id: string
  bot_used?: string
  document_type: string
  title: string
  format?: string // md, html, pdf
  metadata?: any
  credits_used?: number
  created_at: string
  download_count?: number
  is_public?: boolean
  project_id?: string
  content_url?: string // URL to fetch/download actual content
}
export interface GetDocumentsResponse {
  success: boolean
  documents: Document[]
  count: number
}
export interface UploadDocumentResponse extends Document {
  // Assuming upload returns the created document object
  success?: boolean
  message?: string
}

// Memory Dashboard
export interface MemoryDashboardResponse {
  // Define based on what /user/memory-dashboard (if created) would return
  // Example:
  project_progress?: number
  recent_interactions?: any[]
  extracted_keywords?: string[]
  activity_timeline?: any[]
  recommended_steps?: string[]
}

// Outreach
export interface GenerateTemplateRequest {
  context: any // Context for template generation
  project_id: string // Assuming templates are project-specific
}
export interface GenerateTemplateResponse {
  template: string
  credits_used?: number
}
export interface OutreachCampaign {
  id: string
  name: string
  status: "active" | "paused" | "draft" | "completed"
  metrics: {
    sent: number
    responses: number
    meetings: number
  }
  template_id: string
  created_at: string
}
export interface OutreachTemplate {
  id: string
  name: string
  type: "email" | "linkedin"
  subject?: string
  body: string
  created_at: string
}

// Credits & Subscription
export interface CreditsBalanceResponse {
  credits: number
  plan: "free" | "growth" | "pro"
}
export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: "credit" | "debit" // or 'purchase', 'usage', 'bonus'
  description: string
  created_at: string
}
export interface CreditHistoryResponse {
  transactions: CreditTransaction[]
}
export interface SubscriptionPlanDetails {
  id: "free" | "growth" | "pro"
  name: string
  price_monthly: number // e.g., 0, 29, 89
  currency: string // e.g., "EUR"
  credits_monthly: number
  features: string[]
}
export interface UpgradeSubscriptionRequest {
  plan: "growth" | "pro" // Can only upgrade
}
export interface UpgradeSubscriptionResponse {
  message: string
  new_plan: "growth" | "pro"
  credits_added: number
}

// Chat Response Type from backend
export type ChatResponseType =
  | { type: "investor_results_normal"; search_results: { results: InvestorResult[] } }
  | { type: "investor_results_deep"; search_results: { results: InvestorResult[]; deep_analysis: string } }
  | {
      type: "employee_results"
      search_results: { employees: any[]; employees_by_fund?: Record<string, any[]> } // Define EmployeeResult if needed
    }
  | { type: "text_response"; content: string }
  | { type: "document_generated"; document_id: string; document_title: string; message: string }
  | { type: "error"; content: string; error?: string } // Added error field
  // This is the actual structure from app.py's bot_manager.process_user_request
  | { bot: string; response: string; credits_used?: number; error?: string; required?: number; available?: number }

// --- API Helper ---
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorData = { error: `API request failed with status ${response.status}`, message: "" }
      try {
        const parsedError = await response.json()
        errorData = { ...errorData, ...parsedError }
      } catch (e) {
        // Response was not JSON, or JSON parsing failed
        errorData.message = await response.text()
        console.warn(
          `API response for ${endpoint} was not JSON or empty for status ${response.status}. Raw text: ${errorData.message}`,
        )
      }
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`)
    }

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
    return fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) })
  },
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) })
  },
  async googleLogin(data: GoogleLoginRequest): Promise<LoginResponse> {
    return fetchApi("/auth/google", { method: "POST", body: JSON.stringify(data) })
  },

  // User & Profile
  async getProfile(): Promise<ProfileResponse> {
    // Matches GET /user/profile
    return fetchApi("/user/profile")
  },
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    // Backend doesn't have a dedicated PUT /user/profile.
    // This would require a new endpoint or modification of an existing one.
    // For now, simulating.
    console.warn("Simulating profile update. Backend endpoint needed.")
    return new Promise((resolve) => setTimeout(() => resolve({ ...profileDataMock, ...data } as UserProfile), 500))
  },
  async uploadProfilePicture(file: File): Promise<{ profile_picture_url: string }> {
    // Backend doesn't have an endpoint for this. Simulating.
    console.warn("Simulating profile picture upload. Backend endpoint needed.")
    const formData = new FormData()
    formData.append("profile_picture", file)
    // return fetchApi("/user/profile/picture", { method: "POST", body: formData });
    return new Promise((resolve) => setTimeout(() => resolve({ profile_picture_url: URL.createObjectURL(file) }), 1000))
  },

  // Projects
  async getProjects(): Promise<UserProjectsResponse> {
    // Matches GET /projects
    return fetchApi("/projects")
  },
  async createProject(data: CreateProjectRequest): Promise<CreateProjectResponse> {
    // Matches POST /projects
    return fetchApi("/projects", { method: "POST", body: JSON.stringify(data) })
  },
  async getProjectDetails(projectId: string): Promise<{ success: boolean; project: Project }> {
    // Matches GET /projects/<project_id>
    return fetchApi(`/projects/${projectId}`)
  },
  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<UpdateProjectResponse> {
    // Matches PUT /projects/<project_id>
    return fetchApi(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(data) })
  },
  async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    // Matches DELETE /projects/<project_id>
    return fetchApi(`/projects/${projectId}`, { method: "DELETE" })
  },

  // Chat
  async chat(request: ChatRequest): Promise<ChatResponseType> {
    // Matches POST /chat/bot
    return fetchApi("/chat/bot", { method: "POST", body: JSON.stringify(request) })
  },

  // Investor Search
  async searchInvestors(request: InvestorSearchRequest): Promise<InvestorSearchResponse> {
    // Matches POST /search/investors
    // Backend expects 'preferences' for filters.
    return fetchApi("/search/investors", { method: "POST", body: JSON.stringify(request) })
  },

  // Document Management
  async getDocuments(projectId?: string, documentType?: string): Promise<GetDocumentsResponse> {
    // Matches GET /documents
    let url = "/documents"
    const params = new URLSearchParams()
    if (projectId) params.append("project_id", projectId)
    if (documentType) params.append("type", documentType)
    if (params.toString()) url += `?${params.toString()}`
    return fetchApi(url)
  },
  async uploadDocument(file: File, projectId: string, documentType: string): Promise<UploadDocumentResponse> {
    // Backend doesn't have a dedicated document upload endpoint. Simulating.
    console.warn("Simulating document upload. Backend endpoint needed.")
    const formData = new FormData()
    formData.append("document", file)
    formData.append("project_id", projectId)
    formData.append("document_type", documentType)
    // return fetchApi("/documents/upload", { method: "POST", body: formData });
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: `doc_${Date.now()}`,
            title: file.name,
            document_type: documentType,
            created_at: new Date().toISOString(),
            success: true,
            message: "Document uploaded successfully (simulated)",
          }),
        1000,
      ),
    )
  },
  async deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    // Backend doesn't have a dedicated document delete endpoint. Simulating.
    console.warn("Simulating document delete. Backend endpoint needed.")
    // return fetchApi(`/documents/${documentId}`, { method: "DELETE" });
    return new Promise((resolve) =>
      setTimeout(() => resolve({ success: true, message: "Document deleted (simulated)" }), 500),
    )
  },

  // Memory Dashboard
  async getMemoryDashboard(projectId: string): Promise<MemoryDashboardResponse> {
    // Backend doesn't have /user/memory-dashboard. Simulating.
    console.warn("Simulating fetch for memory dashboard. Backend endpoint needed.")
    // return fetchApi(`/user/memory-dashboard?project_id=${projectId}`);
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            project_progress: Math.floor(Math.random() * 100),
            recent_interactions: [
              { id: "1", query: "Test query", bot: "basic_bot", timestamp: new Date().toISOString() },
            ],
            extracted_keywords: ["startup", "funding", "AI"],
            activity_timeline: [{ event: "Project Created", date: new Date().toISOString() }],
            recommended_steps: ["Define target investors", "Prepare pitch deck"],
          }),
        500,
      ),
    )
  },

  // Outreach
  async getOutreachTemplates(projectId: string): Promise<OutreachTemplate[]> {
    // Backend doesn't have an endpoint for listing templates. Simulating.
    console.warn("Simulating fetch for outreach templates. Backend endpoint needed.")
    // return fetchApi(`/outreach/templates?project_id=${projectId}`);
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: "t1",
              name: "Initial Cold Email",
              type: "email",
              subject: "Intro: [Your Company]",
              body: "Hello...",
              created_at: new Date().toISOString(),
            },
            {
              id: "t2",
              name: "LinkedIn Connect",
              type: "linkedin",
              body: "Hi, I'd like to connect.",
              created_at: new Date().toISOString(),
            },
          ]),
        500,
      ),
    )
  },
  async generateOutreachTemplate(data: GenerateTemplateRequest): Promise<GenerateTemplateResponse> {
    // Matches POST /outreach/generate-template
    // This endpoint exists in backend but is a placeholder.
    return fetchApi("/outreach/generate-template", { method: "POST", body: JSON.stringify(data) })
  },
  async getOutreachCampaigns(projectId: string): Promise<OutreachCampaign[]> {
    // Backend doesn't have an endpoint for listing campaigns. Simulating.
    console.warn("Simulating fetch for outreach campaigns. Backend endpoint needed.")
    // return fetchApi(`/outreach/campaigns?project_id=${projectId}`);
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              id: "c1",
              name: "Q3 Investor Outreach",
              status: "active",
              metrics: { sent: 100, responses: 10, meetings: 2 },
              template_id: "t1",
              created_at: new Date().toISOString(),
            },
          ]),
        500,
      ),
    )
  },

  // Credits & Subscription
  async getCreditBalance(): Promise<CreditsBalanceResponse> {
    // Matches GET /credits/balance
    return fetchApi("/credits/balance")
  },
  async getCreditHistory(): Promise<CreditHistoryResponse> {
    // Backend doesn't have an endpoint for credit history. Simulating.
    console.warn("Simulating fetch for credit history. Backend endpoint needed.")
    // return fetchApi("/credits/history");
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            transactions: [
              {
                id: "tx1",
                user_id: "user1",
                amount: -10,
                type: "debit",
                description: "Investor Search",
                created_at: new Date().toISOString(),
              },
              {
                id: "tx2",
                user_id: "user1",
                amount: 100,
                type: "credit",
                description: "Plan Credits",
                created_at: new Date().toISOString(),
              },
            ],
          }),
        500,
      ),
    )
  },
  async getSubscriptionPlans(): Promise<SubscriptionPlanDetails[]> {
    // Backend doesn't have an endpoint for this. Using hardcoded values from backend logic.
    console.warn("Using hardcoded subscription plans. Backend endpoint would be better.")
    return Promise.resolve([
      {
        id: "free",
        name: "Free",
        price_monthly: 0,
        currency: "EUR",
        credits_monthly: 100,
        features: ["Basic Bots", "1 Project", "Limited Searches"],
      },
      {
        id: "growth",
        name: "Growth",
        price_monthly: 29,
        currency: "EUR",
        credits_monthly: 10000,
        features: ["All Bots", "Investor Search", "Employee Search", "5 Projects"],
      },
      {
        id: "pro",
        name: "Pro Outreach",
        price_monthly: 89,
        currency: "EUR",
        credits_monthly: 50000,
        features: ["All Growth Features", "Outreach Templates", "Unlimited Projects", "Priority Support"],
      },
    ])
  },
  async upgradeSubscription(data: UpgradeSubscriptionRequest): Promise<UpgradeSubscriptionResponse> {
    // Matches POST /subscription/upgrade
    return fetchApi("/subscription/upgrade", { method: "POST", body: JSON.stringify(data) })
  },
}

// Mock profile data for simulated updates if needed
const profileDataMock: UserProfile = {
  id: "mock-user-id",
  email: "mock@example.com",
  first_name: "Mock",
  last_name: "User",
  subscription_plan: "free",
  credits: 100,
  created_at: new Date().toISOString(),
  profile_picture_url: "/placeholder-user.jpg",
}
