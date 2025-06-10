"use client"

import type React from "react"

import { useState, useEffect } from "react"
import InvestorCard from "@/components/investor-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface PageProps {
  params: {
    projectId: string
  }
}

export default function InvestorsPage({ params }: PageProps) {
  const [investors, setInvestors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const loadInvestors = async (query?: string) => {
    setIsLoading(true)
    try {
      const results = await api.searchInvestors(query || "", "normal")
      setInvestors(results)
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

  useEffect(() => {
    loadInvestors()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadInvestors(searchQuery)
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Investors</h1>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investors.map((investor) => (
            <InvestorCard
              key={investor.id}
              id={investor.id}
              projectId={"p1"}
              name={investor.Company_Name}
              company={investor.Company_Name}
              location={investor.Company_Location}
              investingStage={investor.Investing_Stage}
              categories={
                Array.isArray(investor.Investment_Categories)
                  ? investor.Investment_Categories
                  : investor.Investment_Categories?.split(",").map((c: string) => c.trim()) || []
              }
              email={investor.Company_Email}
              phone={investor.Company_Phone}
              linkedin={investor.Company_Linkedin}
              website={investor.Company_Website}
              score={investor.Score}
              onStatusChange={() => loadInvestors(searchQuery)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
