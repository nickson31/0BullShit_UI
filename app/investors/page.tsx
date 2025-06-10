"use client"

import type React from "react"
import { useState, useEffect } from "react"
import InvestorsResultsTable from "@/components/investors-results-table"
import DeepAnalysisCard from "@/components/deep-analysis-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { api } from "@/services/api"
import { useApp } from "@/contexts/AppContext"
import { useToast } from "@/components/ui/use-toast"

export default function InvestorsPage() {
  const { lastInvestorResults, lastDeepAnalysis, setLastInvestorResults, setLastDeepAnalysis } = useApp()
  const [investors, setInvestors] = useState(lastInvestorResults)
  const [deepAnalysis, setDeepAnalysis] = useState(lastDeepAnalysis)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setInvestors(lastInvestorResults)
    setDeepAnalysis(lastDeepAnalysis)
  }, [lastInvestorResults, lastDeepAnalysis])

  const loadInvestors = async (query?: string, deep = false) => {
    setIsLoading(true)
    try {
      const results = await api.searchInvestors(query || "", deep ? "deep" : "normal")
      setInvestors(results)
      setLastInvestorResults(results)

      if (deep) {
        // For deep search, we would need to handle the deep analysis response
        // This would come from the chat endpoint, not the direct search
        setDeepAnalysis(null)
        setLastDeepAnalysis(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load investors. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadInvestors(searchQuery)
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Investors {investors.length > 0 && `(${investors.length} results)`}</h1>
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search investors..."
                className="pl-10 w-[300px]"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Search
            </Button>
          </form>
        </div>
      </div>

      {deepAnalysis && (
        <div className="mb-6">
          <DeepAnalysisCard analysis={deepAnalysis} />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      ) : investors.length > 0 ? (
        <InvestorsResultsTable investors={investors} projectId={"p1"} showLimit={false} />
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            No investors found. Try searching for investors using the chat or search above.
          </p>
        </div>
      )}
    </div>
  )
}
