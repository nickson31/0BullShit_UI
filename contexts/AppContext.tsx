"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { InvestorResult, EmployeeResult, Project, UserProfile } from "@/services/api"
import { api } from "@/services/api"
import { useRouter } from "next/navigation"

interface AppContextType {
  // User & Auth
  profile: UserProfile | null
  credits: number | null
  isLoadingProfile: boolean

  // Projects
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  fetchProfileAndProjects: () => Promise<void>

  // Chat search results
  lastInvestorResults: InvestorResult[]
  lastEmployeeResults: EmployeeResult[]
  lastDeepAnalysis: string | null
  setLastInvestorResults: (results: InvestorResult[]) => void
  setLastEmployeeResults: (results: EmployeeResult[]) => void
  setLastDeepAnalysis: (analysis: string | null) => void

  // Documents (added for documents page)
  documents: any[] // TODO: Define a proper Document type
  fetchDocuments: () => Promise<void>
  addDocument: (doc: any) => void // For adding a new document after upload
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const [lastInvestorResults, setLastInvestorResults] = useState<InvestorResult[]>([])
  const [lastEmployeeResults, setLastEmployeeResults] = useState<EmployeeResult[]>([])
  const [lastDeepAnalysis, setLastDeepAnalysis] = useState<string | null>(null)

  const [documents, setDocuments] = useState<any[]>([]) // State for documents

  const router = useRouter()

  const fetchProfileAndProjects = useCallback(async () => {
    setIsLoadingProfile(true)
    const token = localStorage.getItem("authToken")
    if (!token) {
      setIsLoadingProfile(false)
      // No need to redirect here, AuthProvider handles it
      return
    }

    try {
      const profileData = await api.getProfile()
      setProfile(profileData.user || null)
      setCredits(profileData.user?.credits ?? null)

      setProjects(profileData.projects || [])

      if (profileData.projects && profileData.projects.length > 0) {
        const lastProjectId = localStorage.getItem("lastProjectId")
        const projectToSet = profileData.projects.find((p) => p.id === lastProjectId) || profileData.projects[0]
        setCurrentProject(projectToSet)
      } else {
        setCurrentProject(null)
      }
    } catch (error) {
      console.error("Failed to fetch profile and projects:", error)
      localStorage.removeItem("authToken")
      setProfile(null)
      setProjects([])
      setCurrentProject(null)
      router.push("/login")
    } finally {
      setIsLoadingProfile(false)
    }
  }, [router])

  /**
   * Descarga la lista de documentos del usuario solo cuando hay sesión iniciada.
   * De lo contrario salimos silenciosamente para evitar el error “Failed to fetch”.
   */
  const fetchDocuments = useCallback(async () => {
    // Si no hay token no intentamos llamar al backend
    if (typeof window !== "undefined" && !localStorage.getItem("authToken")) {
      setDocuments([]) // Reseteamos a lista vacía
      return
    }

    try {
      const fetchedDocuments = await api.getDocuments()
      setDocuments(fetchedDocuments || [])
    } catch (error) {
      // Mostramos el warning una sola vez
      if (process.env.NODE_ENV !== "production") {
        console.warn("Failed to fetch documents, using empty list.", error)
      }
      setDocuments([])
    }
  }, [])

  const addDocument = useCallback((newDoc: any) => {
    setDocuments((prev) => [...prev, newDoc])
  }, [])

  useEffect(() => {
    fetchProfileAndProjects()
    fetchDocuments() // Fetch documents on app load
  }, [fetchProfileAndProjects, fetchDocuments])

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
    projects,
    currentProject,
    setCurrentProject: handleSetCurrentProject,
    fetchProfileAndProjects,
    lastInvestorResults,
    lastEmployeeResults,
    lastDeepAnalysis,
    setLastInvestorResults,
    setLastEmployeeResults,
    setLastDeepAnalysis,
    documents,
    fetchDocuments,
    addDocument,
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
