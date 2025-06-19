"use client"
import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { UserProfile, Project, InvestorResult, EmployeeResult, Document as ApiDocument } from "@/services/api" // Renamed Document to ApiDocument
import { api } from "@/services/api"
import { useRouter, usePathname } from "next/navigation" // Added usePathname

interface AppContextType {
  // User & Auth
  profile: UserProfile | null
  credits: number // Ensure credits is always a number
  isLoadingProfile: boolean
  fetchProfileAndProjects: () => Promise<void> // Expose to allow manual refresh

  // Projects
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  createProject: (name: string, description?: string) => Promise<Project | null>
  isLoadingProjects: boolean

  // Chat search results
  lastInvestorResults: InvestorResult[]
  lastEmployeeResults: EmployeeResult[]
  lastDeepAnalysis: string | null
  setLastInvestorResults: (results: InvestorResult[]) => void
  setLastEmployeeResults: (results: EmployeeResult[]) => void
  setLastDeepAnalysis: (analysis: string | null) => void

  // Documents
  documents: ApiDocument[]
  fetchDocuments: (projectId?: string) => Promise<void>
  uploadAndAddDocument: (file: File, projectId: string, documentType: string) => Promise<void>
  deleteDocumentState: (documentId: string) => void
  isLoadingDocuments: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [credits, setCredits] = useState<number>(0) // Default to 0
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  const [lastInvestorResults, setLastInvestorResults] = useState<InvestorResult[]>([])
  const [lastEmployeeResults, setLastEmployeeResults] = useState<EmployeeResult[]>([])
  const [lastDeepAnalysis, setLastDeepAnalysis] = useState<string | null>(null)

  const [documents, setDocuments] = useState<ApiDocument[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const fetchProfileAndProjects = useCallback(async () => {
    setIsLoadingProfile(true)
    setIsLoadingProjects(true)
    const token = localStorage.getItem("authToken")

    if (!token) {
      setProfile(null)
      setCredits(0)
      setProjects([])
      setCurrentProject(null)
      setIsLoadingProfile(false)
      setIsLoadingProjects(false)
      if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
        router.push("/login")
      }
      return
    }

    try {
      const [profileData, projectsData] = await Promise.all([api.getProfile(), api.getProjects()])

      setProfile(profileData || null)
      setCredits(profileData?.credits ?? 0) // Use profileData.credits

      setProjects(projectsData.projects || [])

      if (projectsData.projects && projectsData.projects.length > 0) {
        const lastProjectId = localStorage.getItem("lastProjectId")
        const projectToSet = projectsData.projects.find((p) => p.id === lastProjectId) || projectsData.projects[0]
        setCurrentProject(projectToSet)
        if (projectToSet) {
          await fetchDocuments(projectToSet.id) // Fetch documents for current project
        }
      } else {
        setCurrentProject(null)
        setDocuments([]) // No project, no documents
      }
    } catch (error) {
      console.error("Failed to fetch profile and projects:", error)
      localStorage.removeItem("authToken")
      setProfile(null)
      setCredits(0)
      setProjects([])
      setCurrentProject(null)
      setDocuments([])
      if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
        router.push("/login")
      }
    } finally {
      setIsLoadingProfile(false)
      setIsLoadingProjects(false)
    }
  }, [router, pathname]) // Added pathname

  const createProject = async (name: string, description?: string): Promise<Project | null> => {
    try {
      const newProjectResponse = await api.createProject({ name, description })
      if (newProjectResponse.success && newProjectResponse.project_id) {
        // Refetch all projects to get the full new project object
        await fetchProfileAndProjects()
        // Find and set the newly created project as current
        // This relies on fetchProfileAndProjects updating the projects list
        // and then finding it. A bit indirect.
        // A more direct way would be if createProject returned the full project object.
        // For now, let's assume fetchProfileAndProjects will make it available.
        const newProject = projects.find((p) => p.id === newProjectResponse.project_id) || null
        if (newProject) setCurrentProject(newProject)
        else await fetchProfileAndProjects() // try refetching if not found immediately
        return newProject
      }
      return null
    } catch (error) {
      console.error("Failed to create project in context:", error)
      return null
    }
  }

  const fetchDocuments = useCallback(
    async (projectId?: string) => {
      const targetProjectId = projectId || currentProject?.id
      if (!targetProjectId) {
        setDocuments([])
        return
      }
      setIsLoadingDocuments(true)
      try {
        const response = await api.getDocuments(targetProjectId)
        setDocuments(response.documents || [])
      } catch (error) {
        console.error("Failed to fetch documents:", error)
        setDocuments([])
      } finally {
        setIsLoadingDocuments(false)
      }
    },
    [currentProject?.id],
  )

  const uploadAndAddDocument = async (file: File, projectId: string, documentType: string) => {
    setIsLoadingDocuments(true)
    try {
      const newDoc = await api.uploadDocument(file, projectId, documentType)
      setDocuments((prev) => [...prev, newDoc])
    } catch (error) {
      console.error("Failed to upload document:", error)
      // Handle error (e.g., show toast)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const deleteDocumentState = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
  }

  useEffect(() => {
    fetchProfileAndProjects()
  }, [fetchProfileAndProjects]) // Initial fetch

  useEffect(() => {
    if (currentProject?.id) {
      fetchDocuments(currentProject.id)
    } else {
      setDocuments([]) // Clear documents if no project selected
    }
  }, [currentProject?.id, fetchDocuments])

  const handleSetCurrentProject = (project: Project | null) => {
    setCurrentProject(project)
    if (project) {
      localStorage.setItem("lastProjectId", project.id)
    } else {
      localStorage.removeItem("lastProjectId")
    }
  }

  const value = {
    profile,
    credits,
    isLoadingProfile,
    fetchProfileAndProjects,
    projects,
    currentProject,
    setCurrentProject: handleSetCurrentProject,
    createProject,
    isLoadingProjects,
    lastInvestorResults,
    lastEmployeeResults,
    lastDeepAnalysis,
    setLastInvestorResults,
    setLastEmployeeResults,
    setLastDeepAnalysis,
    documents,
    fetchDocuments,
    uploadAndAddDocument,
    deleteDocumentState,
    isLoadingDocuments,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
