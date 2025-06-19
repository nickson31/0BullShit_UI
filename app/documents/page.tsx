"use client"

import type React from "react"

import { UploadCloud, FileIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api } from "@/services/api" // Import Document type

export default function DocumentsPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { documents, fetchDocuments, addDocument, currentProject } = useApp() // Use documents from AppContext

  useEffect(() => {
    fetchDocuments() // Ensure documents are fetched when page loads
  }, [fetchDocuments])

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      if (!currentProject) {
        toast({
          title: "No Project Selected",
          description: "Please select a project before uploading documents.",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      try {
        for (const file of Array.from(files)) {
          // Call the simulated upload API
          const newDoc = await api.uploadDocument(file, currentProject.id)
          addDocument(newDoc) // Add the new document to AppContext state
          toast({
            title: "Document Uploaded",
            description: `"${newDoc.name}" has been uploaded successfully.`,
          })
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: (error as Error).message || "Failed to upload document(s).",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    },
    [addDocument, currentProject, toast],
  )

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files)
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <label
          htmlFor="file-upload"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Document
          <input
            id="file-upload"
            type="file"
            multiple
            className="sr-only"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>

      {documents.length === 0 && !isUploading ? (
        <div
          className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200
            ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloud
            className={`h-12 w-12 mb-4 ${isDragging ? "text-blue-600" : "text-slate-400 dark:text-slate-500"}`}
          />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Drag & Drop Files Here</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Or click the button above to upload documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isUploading && (
            <Card className="flex flex-col items-center justify-center p-6 animate-pulse">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-semibold">Uploading...</p>
              <p className="text-sm text-muted-foreground">Please wait</p>
            </Card>
          )}
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  {doc.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground">{doc.type}</span>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Size: {doc.size}</div>
                <div className="text-sm text-muted-foreground">Uploaded: {doc.uploadedAt}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => toast({ title: "View Document", description: `Viewing ${doc.name}` })}
                >
                  View Document
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
