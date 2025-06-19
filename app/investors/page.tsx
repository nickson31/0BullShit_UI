"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type InvestorResult } from "@/services/api"
import {
  Search,
  Star,
  StarOff,
  MapPin,
  DollarSign,
  Tag,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data for filters (replace with dynamic data from backend if available)
const mockLocations = ["New York", "San Francisco", "London", "Berlin", "Singapore"]
const mockStages = ["Seed", "Series A", "Series B", "Growth", "Late Stage"]
const mockCategories = ["Fintech", "SaaS", "AI", "Healthcare", "E-commerce", "Biotech", "Deep Tech"]

export default function InvestorsPage() {
  const { toast } = useToast()
  const { currentProject } = useApp()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [investors, setInvestors] = useState<InvestorResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1) // Assuming pagination from backend or calculated
  const itemsPerPage = 10 // Number of items per page

  // Client-side favorites (no backend endpoint provided for this yet)
  const [favoriteInvestorIds, setFavoriteInvestorIds] = useState<Set<string>>(new Set())

  const toggleFavorite = useCallback(
    (investorId: string) => {
      setFavoriteInvestorIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(investorId)) {
          newSet.delete(investorId)
          toast({ title: "Removed from favorites", description: "Investor removed from your favorites." })
        } else {
          newSet.add(investorId)
          toast({ title: "Added to favorites", description: "Investor added to your favorites!" })
        }
        // TODO: If backend endpoint for favorites becomes available, call it here
        return newSet
      })
    },
    [toast],
  )

  const fetchInvestors = useCallback(async () => {
    if (!currentProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project to search for investors.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await api.searchInvestors({
        query: searchTerm,
        project_id: currentProject.id,
        filters: {
          locations: selectedLocations,
          stages: selectedStages,
          categories: selectedCategories,
        },
        page: currentPage,
        per_page: itemsPerPage,
      })

      setInvestors(response.results || [])
      // Assuming backend returns total_pages or total_count
      setTotalPages(response.total_pages || Math.ceil((response.total_count || 0) / itemsPerPage) || 1)
    } catch (error) {
      toast({
        title: "Failed to fetch investors",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      })
      setInvestors([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedLocations, selectedStages, selectedCategories, currentProject, currentPage, toast])

  useEffect(() => {
    fetchInvestors()
  }, [fetchInvestors])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchInvestors()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const renderFilterDropdown = (
    title: string,
    icon: React.ElementType,
    options: string[],
    selected: string[],
    onSelect: (value: string) => void,
  ) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span className="flex items-center gap-2">
            {React.createElement(icon, { className: "h-4 w-4" })}
            {title}
          </span>
          {selected.length > 0 && <span className="ml-1 text-xs font-semibold">({selected.length})</span>}
          <ChevronDown className="ml-auto h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2">
        <ScrollArea className="h-48">
          {options.map((option) => (
            <DropdownMenuItem key={option} onSelect={(e) => e.preventDefault()} className="cursor-pointer">
              <Checkbox
                id={`${title}-${option}`}
                checked={selected.includes(option)}
                onCheckedChange={() => onSelect(option)}
                className="mr-2"
              />
              <Label htmlFor={`${title}-${option}`}>{option}</Label>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  const toggleFilter =
    (filterArray: string[], setFilterArray: React.Dispatch<React.SetStateAction<string[]>>) => (value: string) => {
      setFilterArray((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
      setCurrentPage(1) // Reset to first page on filter change
    }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Investor Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search investors by name, company, or focus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6">
        {renderFilterDropdown(
          "Location",
          MapPin,
          mockLocations,
          selectedLocations,
          toggleFilter(selectedLocations, setSelectedLocations),
        )}
        {renderFilterDropdown(
          "Stage",
          DollarSign,
          mockStages,
          selectedStages,
          toggleFilter(selectedStages, setSelectedStages),
        )}
        {renderFilterDropdown(
          "Category",
          Tag,
          mockCategories,
          selectedCategories,
          toggleFilter(selectedCategories, setSelectedCategories),
        )}
      </div>

      <Separator className="my-6" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(itemsPerPage)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Search className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Investors Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investors.map((investor) => (
              <Card key={investor.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{investor.Company_Name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(investor.id)}
                    className="text-yellow-500"
                  >
                    {favoriteInvestorIds.has(investor.id) ? (
                      <Star className="h-5 w-5 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardDescription className="text-sm text-muted-foreground">
                    {investor.Company_Description}
                  </CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" /> {investor.Company_Location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="mr-1 h-4 w-4" />{" "}
                    {Array.isArray(investor.Investing_Stage)
                      ? investor.Investing_Stage.join(", ")
                      : investor.Investing_Stage}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {investor.Investment_Categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
