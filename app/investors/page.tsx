"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
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
import { api, type InvestorResult, type InvestorSearchRequest } from "@/services/api"
import {
  Search,
  Star,
  MapPin,
  DollarSign,
  Tag,
  Loader2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Users,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import GrowthUpsellCard from "@/components/growth-upsell-card" // Upsell card
import cn from "classnames" // Import cn for classnames utility

// Mock data for filters (replace with dynamic data from backend if available)
const MOCK_LOCATIONS = ["New York", "San Francisco", "London", "Berlin", "Singapore", "Remote"]
const MOCK_STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "Growth", "Late Stage"]
const MOCK_CATEGORIES = [
  "Fintech",
  "SaaS",
  "AI/ML",
  "Healthcare",
  "E-commerce",
  "Biotech",
  "Deep Tech",
  "Web3",
  "Climate Tech",
  "EdTech",
]
const ITEMS_PER_PAGE = 12

export default function InvestorsPage() {
  const { toast } = useToast()
  const { currentProject, profile, isLoadingProfile } = useApp()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [investors, setInvestors] = useState<InvestorResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalInvestors, setTotalInvestors] = useState(0) // Total results for pagination

  // Client-side favorites (no backend endpoint provided for this yet)
  const [favoriteInvestorIds, setFavoriteInvestorIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favoriteInvestors")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    }
    return new Set()
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteInvestors", JSON.stringify(Array.from(favoriteInvestorIds)))
    }
  }, [favoriteInvestorIds])

  const toggleFavorite = useCallback(
    (investorId: string, investorName?: string) => {
      setFavoriteInvestorIds((prev) => {
        const newSet = new Set(prev)
        const name = investorName || "Investor"
        if (newSet.has(investorId)) {
          newSet.delete(investorId)
          toast({ title: "Removed from Favorites", description: `${name} removed from your favorites.` })
        } else {
          newSet.add(investorId)
          toast({ title: "Added to Favorites", description: `${name} added to your favorites!` })
        }
        return newSet
      })
    },
    [toast],
  )

  const fetchInvestors = useCallback(
    async (page = 1) => {
      if (!currentProject) {
        // Don't toast immediately, might be initial load before project selection
        // toast({ title: "No Project Selected", description: "Please select a project to search for investors.", variant: "destructive" });
        setInvestors([])
        setTotalInvestors(0)
        return
      }
      if (profile?.subscription_plan === "free") {
        // For free plan, we don't fetch, just show upsell
        setInvestors([])
        setTotalInvestors(0)
        return
      }

      setIsLoading(true)
      const requestPayload: InvestorSearchRequest = {
        query: searchTerm.trim(),
        project_id: currentProject.id,
        preferences: {},
        page: page,
        per_page: ITEMS_PER_PAGE,
      }
      if (selectedLocations.length > 0) requestPayload.preferences!.locations = selectedLocations
      if (selectedStages.length > 0) requestPayload.preferences!.stages = selectedStages
      if (selectedCategories.length > 0) requestPayload.preferences!.categories = selectedCategories

      try {
        const response = await api.searchInvestors(requestPayload)
        setInvestors(response.results || [])
        // Backend doesn't provide total_count, so we'll estimate or handle limited results
        // For now, let's assume the backend might return a full list or we paginate based on what we get
        setTotalInvestors(response.results?.length || 0) // This is not ideal for real pagination
        setCurrentPage(page)
      } catch (error) {
        toast({
          title: "Failed to Fetch Investors",
          description: (error as Error).message || "Please try again.",
          variant: "destructive",
        })
        setInvestors([])
        setTotalInvestors(0)
      } finally {
        setIsLoading(false)
      }
    },
    [
      currentProject,
      searchTerm,
      selectedLocations,
      selectedStages,
      selectedCategories,
      profile?.subscription_plan,
      toast,
    ],
  )

  useEffect(() => {
    if (currentProject && profile?.subscription_plan !== "free") {
      fetchInvestors(1) // Fetch on initial relevant conditions or filter changes
    }
  }, [currentProject, profile?.subscription_plan]) // Removed fetchInvestors from dep array to avoid loop, trigger manually

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (profile?.subscription_plan !== "free") {
      fetchInvestors(1)
    } else {
      toast({ title: "Upgrade Required", description: "Investor search is a Growth plan feature.", variant: "default" })
    }
  }

  const totalPages = Math.ceil(totalInvestors / ITEMS_PER_PAGE)

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
      fetchInvestors(newPage)
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
        <ScrollArea className="h-[200px]">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option}
              checked={selected.includes(option)}
              onCheckedChange={() => onToggle(option)}
              onSelect={(e) => e.preventDefault()} // Prevent closing on select
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
    // fetchInvestors(1); // Trigger search on filter change
  }

  const clearFilters = () => {
    setSelectedLocations([])
    setSelectedStages([])
    setSelectedCategories([])
    // fetchInvestors(1); // Trigger search
  }

  const activeFiltersCount = selectedLocations.length + selectedStages.length + selectedCategories.length

  if (isLoadingProfile) {
    return (
      <div className="container py-6 space-y-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (profile?.subscription_plan === "free") {
    return (
      <div className="container py-6 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Users className="h-16 w-16 text-blue-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-center">Unlock Investor Search</h1>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
          Find the perfect investors for your startup with our advanced search and filtering capabilities. Upgrade to
          the Growth plan to access this feature.
        </p>
        <GrowthUpsellCard onUnlock={() => (window.location.href = "/credits")} />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Investor Database</h1>
        <Button
          onClick={() => {
            /* TODO: Advanced search modal? */ toast({ title: "Advanced Search Coming Soon" })
          }}
        >
          <Filter className="mr-2 h-4 w-4" /> Advanced Filters
        </Button>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-2 mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800 shadow"
      >
        <div className="relative flex-grow">
          <Input
            placeholder="Search by name, company, keywords (e.g., 'AI healthcare seed San Francisco')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Button type="submit" disabled={isLoading} className="h-12 px-6 text-base">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search Investors"}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <FilterDropdown
          title="Location"
          icon={MapPin}
          options={MOCK_LOCATIONS}
          selected={selectedLocations}
          onToggle={(val) => toggleFilter(setSelectedLocations, val)}
        />
        <FilterDropdown
          title="Stage"
          icon={DollarSign}
          options={MOCK_STAGES}
          selected={selectedStages}
          onToggle={(val) => toggleFilter(setSelectedStages, val)}
        />
        <FilterDropdown
          title="Category"
          icon={Tag}
          options={MOCK_CATEGORIES}
          selected={selectedCategories}
          onToggle={(val) => toggleFilter(setSelectedCategories, val)}
        />
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1.5 h-4 w-4" /> Clear Filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-1 mt-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <Users className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Investors Found</h2>
          <p className="text-md text-slate-500 dark:text-slate-400 max-w-md">
            Try adjusting your search query or filters. Broader terms might yield more results.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {investors.length} of ~{totalInvestors} investors. {/* Adjust if backend gives total */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {investors.map((investor) => (
              <Card key={investor.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight text-slate-800 dark:text-slate-100">
                      {investor.name || investor.company_name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(investor.id, investor.name || investor.company_name)}
                      className={cn(
                        "h-8 w-8 shrink-0",
                        favoriteInvestorIds.has(investor.id)
                          ? "text-yellow-500 hover:text-yellow-400"
                          : "text-slate-400 hover:text-yellow-500",
                      )}
                      aria-label={favoriteInvestorIds.has(investor.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={cn("h-5 w-5", favoriteInvestorIds.has(investor.id) && "fill-current")} />
                    </Button>
                  </div>
                  {investor.company_name && investor.name !== investor.company_name && (
                    <CardDescription className="text-xs">{investor.company_name}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 text-sm flex-grow">
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-3 text-xs leading-relaxed">
                    {investor.description || "No description available."}
                  </p>
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs pt-1">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0" /> {investor.location || "N/A"}
                  </div>
                  <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs">
                    <DollarSign className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                    {Array.isArray(investor.investing_stage)
                      ? investor.investing_stage.join(", ")
                      : investor.investing_stage || "N/A"}
                  </div>
                  <div className="pt-1.5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Focus Areas:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(investor.categories || []).slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          {category}
                        </span>
                      ))}
                      {(investor.categories || []).length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{(investor.categories || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() =>
                      toast({
                        title: "View Details",
                        description: `Details for ${investor.name || investor.company_name} coming soon.`,
                      })
                    }
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                aria-label="Previous page"
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
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
