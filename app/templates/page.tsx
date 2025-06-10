"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/AppContext"
import { api, type InvestorResult, type EmployeeResult, type GenerateTemplateRequest } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { FileText, Users, UserCircle2, Sparkles, Loader2, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams, useRouter } from "next/navigation" // Added useRouter

type SelectedEntityType = (InvestorResult & { type: "investor" }) | (EmployeeResult & { type: "employee" })

export default function TemplatesPage() {
  // Ensured default export
  const { favoriteInvestors, favoriteEmployees, loadFavorites } = useApp()
  const { toast } = useToast()
  const router = useRouter() // Added router
  const searchParams = useSearchParams()

  const [selectedEntity, setSelectedEntity] = useState<SelectedEntityType | null>(null)
  const [platform, setPlatform] = useState<"email" | "linkedin">("email")
  const [instructions, setInstructions] = useState("")
  const [generatedTemplate, setGeneratedTemplate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoadingInitialEntity, setIsLoadingInitialEntity] = useState(true)

  useEffect(() => {
    loadFavorites().then(() => {
      const entityId = searchParams.get("entityId")
      const entityType = searchParams.get("entityType") as "investor" | "employee" | null

      if (entityId && entityType) {
        let foundEntity: SelectedEntityType | undefined | null = null
        if (entityType === "investor") {
          foundEntity = favoriteInvestors.find((inv) => inv.id === entityId) as
            | (InvestorResult & { type: "investor" })
            | undefined
          if (foundEntity) foundEntity.type = "investor"
        } else if (entityType === "employee") {
          foundEntity = favoriteEmployees.find((emp) => emp.id === entityId) as
            | (EmployeeResult & { type: "employee" })
            | undefined
          if (foundEntity) foundEntity.type = "employee"
        }

        if (foundEntity) {
          setSelectedEntity(foundEntity)
        } else {
          toast({
            title: "Entity not found",
            description: "The selected entity could not be found in your favorites.",
            variant: "destructive",
          })
        }
      }
      setIsLoadingInitialEntity(false)
    })
  }, [loadFavorites, searchParams, favoriteInvestors, favoriteEmployees, toast])

  const handleGenerateClick = (entity: SelectedEntityType) => {
    setSelectedEntity(entity)
    setInstructions("")
    setPlatform("email")
    setGeneratedTemplate("")
    // Clear query params if user selects a new entity from the list
    router.replace("/templates", undefined)
  }

  const handleGenerateTemplate = async () => {
    if (!selectedEntity) {
      // Instructions are now optional
      toast({
        title: "Missing Entity",
        description: "Please select an entity.",
        variant: "destructive",
      })
      return
    }
    setIsGenerating(true)
    setGeneratedTemplate("")
    try {
      const requestData: GenerateTemplateRequest = {
        target_entity_id: selectedEntity.id,
        target_entity_type: selectedEntity.type,
        platform,
        instructions: instructions.trim(), // Send trimmed instructions
      }
      const response = await api.generateTemplate(requestData)
      setGeneratedTemplate(response.template)
      setShowTemplateModal(true)
    } catch (error) {
      toast({
        title: "Error Generating Template",
        description: (error as Error).message || "Could not generate template.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedTemplate)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: "Template Copied!" })
      })
      .catch((_err) => {
        toast({ title: "Copy Failed", description: "Could not copy template to clipboard.", variant: "destructive" })
      })
  }

  const renderEntityCard = (entity: SelectedEntityType) => {
    const isInvestor = entity.type === "investor"
    const name = isInvestor ? (entity as InvestorResult).Company_Name : (entity as EmployeeResult).fullName
    const description = isInvestor
      ? (entity as InvestorResult).Company_Description || (entity as InvestorResult).Company_Location
      : (entity as EmployeeResult).current_job_title

    return (
      <Card key={entity.id} className="w-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {isInvestor ? <Users className="h-4 w-4" /> : <UserCircle2 className="h-4 w-4" />}
            {name}
          </CardTitle>
          <CardDescription className="text-xs line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => handleGenerateClick(entity)} size="sm" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Template
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isLoadingInitialEntity && searchParams.get("entityId")) {
    return (
      <div className="container py-6 mx-auto flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading selected entity...</p>
      </div>
    )
  }

  return (
    <div className="container py-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Generate Outreach Templates</h1>
      </div>

      {selectedEntity && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              Configure Template for{" "}
              {selectedEntity.type === "investor"
                ? (selectedEntity as InvestorResult).Company_Name
                : (selectedEntity as EmployeeResult).fullName}
            </CardTitle>
            <CardDescription>Set the platform and provide optional specific instructions for the AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={(value: "email" | "linkedin") => setPlatform(value)}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="instructions">Instructions / Key Points (Optional)</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Mention their recent investment in XYZ, highlight our traction in the B2B SaaS space, ask for advice on Series A."
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateTemplate} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Saved Investors ({favoriteInvestors.length})</h2>
          {favoriteInvestors.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {favoriteInvestors.map((inv) => renderEntityCard({ ...inv, type: "investor" }))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No saved investors. Add some from the Favourites page or chat.
            </p>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Saved Employees ({favoriteEmployees.length})</h2>
          {favoriteEmployees.length > 0 ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {favoriteEmployees.map((emp) => renderEntityCard({ ...emp, type: "employee" }))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No saved employees. Add some from the Favourites page or chat.
            </p>
          )}
        </div>
      </div>

      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generated Template</DialogTitle>
            <DialogDescription>
              Review and edit the generated template below. Copy it for your outreach.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <Textarea
              value={generatedTemplate}
              onChange={(e) => setGeneratedTemplate(e.target.value)}
              rows={15}
              className="text-sm"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
            <Button onClick={handleCopyToClipboard}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {favoriteInvestors.length === 0 && favoriteEmployees.length === 0 && !selectedEntity && (
        <div className="mt-10 flex flex-col items-center justify-center h-60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center p-4">
          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No Saved Contacts for Templates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Save investors or employees from your searches or the Favourites page to generate personalized outreach
            templates for them.
          </p>
        </div>
      )}
    </div>
  )
}
