"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api } from "@/services/api"
import {
  UploadCloud,
  FileText,
  Search,
  Download,
  Eye,
  Trash2,
  Loader2,
  X,
  FileType2,
  Bot,
  ChevronDown,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns" // For date formatting

// Mock data for filters (replace with dynamic data from backend if available)
const MOCK_BOTS_USED = ["Investor Match Bot", "Pitch Deck Bot", "Market Analysis Bot", "Content Gen Bot"]
const MOCK_DOCUMENT_TYPES = ["Pitch Deck Outline", "Investor List", "Market Report", "Email Draft", "Executive Summary"]

export default function DocumentsPage() {
  const { toast } = useToast()
  const {
    currentProject,
    documents,
    fetchDocuments,
    uploadAndAddDocument,
    deleteDocumentState,
    isLoadingDocuments: isLoadingAppContextDocs,
  } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBots, setSelectedBots] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (currentProject?.id) {
      fetchDocuments(currentProject.id)
    }
  }, [currentProject?.id, fetchDocuments])

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBot = selectedBots.length === 0 || (doc.bot_used && selectedBots.includes(doc.bot_used))
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(doc.document_type)
    return matchesSearch && matchesBot && matchesType
  })

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (!currentProject) {
        toast({
          title: "No Project Selected",
          description: "Please select a project to upload documents to.",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      try {
        for (const file of Array.from(files)) {
          // Assuming a generic document type for direct uploads, or could add a selector
          await uploadAndAddDocument(file, currentProject.id, "Uploaded Document")
        }
        toast({ title: "Upload Successful", description: `${files.length} file(s) processed.` })
      } catch (error) {
        toast({ title: "Upload Failed", description: (error as Error).message, variant: "destructive" })
      } finally {
        setIsUploading(false)
      }
    },
    [currentProject, uploadAndAddDocument, toast],
  )

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, type: "enter" | "leave" | "over" | "drop") => {
    e.preventDefault()
    e.stopPropagation()
    switch (type) {
      case "enter":
      case "over":
        setIsDragging(true)
        if (type === "over") e.dataTransfer.dropEffect = "copy"
        break
      case "leave":
        setIsDragging(false)
        break
      case "drop":
        setIsDragging(false)
        handleFileUpload(e.dataTransfer.files)
        break
    }
  }

  const handleDeleteDocument = async (docId: string, docTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}"? This action cannot be undone.`)) return
    try {
      await api.deleteDocument(docId) // This is simulated in api.ts
      deleteDocumentState(docId) // Update local state
      toast({ title: "Document Deleted", description: `"${docTitle}" has been deleted.` })
    } catch (error) {
      toast({ title: "Deletion Failed", description: (error as Error).message, variant: "destructive" })
    }
  }

  const FilterDropdown = ({
    title,
    icon: Icon,
    options,
    selected,
    onToggle,
  }: {
    title: string
    icon: React.ElementType
    options: string[]
    selected: string[]
    onToggle: (value: string) => void
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-sm whitespace-nowrap">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
          {selected.length > 0 && (
            <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              {selected.length}
            </span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-0">
        <DropdownMenuLabel className="px-2 py-1.5">{`Filter by ${title}`}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[150px]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option)}
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer"
            >
              {option}
            </DropdownMenuCheckboxItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const clearFilters = () => {
    setSelectedBots([])
    setSelectedTypes([])
    setSearchTerm("")
  }
  const activeFiltersCount = selectedBots.length + selectedTypes.length + (searchTerm ? 1 : 0)

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Project Documents</h1>
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading || !currentProject}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          Upload Document
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          multiple
          className="hidden"
        />
      </div>

      {!currentProject && !isLoadingAppContextDocs && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <FileText className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Project Selected</h2>
          <p className="text-md text-slate-500 dark:text-slate-400 max-w-md">
            Please select a project from the sidebar to view or upload documents.
          </p>
        </div>
      )}

      {currentProject && (
        <>
          <Card className="mb-6 bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Input
                    placeholder="Search documents by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterDropdown
                    title="Bot Used"
                    icon={Bot}
                    options={MOCK_BOTS_USED}
                    selected={selectedBots}
                    onToggle={(val) => toggleFilter(setSelectedBots, val)}
                  />
                  <FilterDropdown
                    title="Type"
                    icon={FileType2}
                    options={MOCK_DOCUMENT_TYPES}
                    selected={selectedTypes}
                    onToggle={(val) => toggleFilter(setSelectedTypes, val)}
                  />
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-sm text-muted-foreground hover:text-foreground h-11"
                    >
                      <X className="mr-1.5 h-4 w-4" /> Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {(isLoadingAppContextDocs || isUploading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoadingAppContextDocs && !isUploading && filteredDocuments.length === 0 && (
            <div
              className={`flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg transition-colors duration-200
                    ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50" : "border-slate-200 dark:border-slate-700"}`}
              onDragEnter={(e) => handleDragEvents(e, "enter")}
              onDragLeave={(e) => handleDragEvents(e, "leave")}
              onDragOver={(e) => handleDragEvents(e, "over")}
              onDrop={(e) => handleDragEvents(e, "drop")}
            >
              <UploadCloud
                className={`h-16 w-16 mb-6 ${isDragging ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}
              />
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {searchTerm || selectedBots.length || selectedTypes.length
                  ? "No Documents Match Filters"
                  : "No Documents Yet"}
              </h2>
              <p className="text-md text-slate-500 dark:text-slate-400 max-w-md mb-6">
                {searchTerm || selectedBots.length || selectedTypes.length
                  ? "Try adjusting your search or filters."
                  : "Drag & drop files here or use the upload button to add your first document."}
              </p>
            </div>
          )}

          {!isLoadingAppContextDocs && !isUploading && filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-md font-semibold leading-tight text-slate-700 dark:text-slate-200 line-clamp-2">
                        {doc.title}
                      </CardTitle>
                      <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
                    </div>
                    <CardDescription className="text-xs">
                      Type: {doc.document_type} {doc.bot_used && `(Bot: ${doc.bot_used})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-500 dark:text-slate-400 flex-grow">
                    <p>Created: {format(new Date(doc.created_at), "MMM d, yyyy - h:mm a")}</p>
                    {doc.credits_used && <p>Credits Used: {doc.credits_used}</p>}
                  </CardContent>
                  <CardFooter className="pt-3 mt-auto flex justify-between items-center gap-2">
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toast({ title: "Preview", description: `Previewing ${doc.title}` })}
                      >
                        <Eye className="h-4 w-4" /> <span className="sr-only">Preview</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toast({ title: "Download", description: `Downloading ${doc.title}` })}
                      >
                        <Download className="h-4 w-4" /> <span className="sr-only">Download</span>
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-700/20"
                      onClick={() => handleDeleteDocument(doc.id, doc.title)}
                    >
                      <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
