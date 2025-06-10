"use client"

import { useApp } from "@/contexts/AppContext"
import { Users } from "lucide-react"
import CompactInvestorCard from "@/components/compact-investor-card"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/services/api"
import { useCallback } from "react"

export default function InvestorsPage() {
  const { lastInvestorResults, favoriteInvestors, addToFavorites, removeFromFavorites } = useApp()
  const { toast } = useToast()

  const handleInvestorLikeDislike = useCallback(
    async (investorId: string, action: "like" | "dislike") => {
      try {
        await api.updateInvestorSentiment(investorId, action)
        const investor = lastInvestorResults.find((inv) => inv.id === investorId)

        if (investor) {
          if (action === "like") {
            addToFavorites(investor, "investor")
            toast({ title: "Investor Liked", description: `${investor.Company_Name} added to favorites.` })
          } else {
            removeFromFavorites(investorId, "investor")
            toast({ title: "Investor Disliked", description: `${investor.Company_Name} removed from favorites.` })
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      }
    },
    [addToFavorites, removeFromFavorites, toast, lastInvestorResults],
  )

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Investor Results {lastInvestorResults.length > 0 && `(${lastInvestorResults.length})`}
        </h1>
      </div>

      {lastInvestorResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lastInvestorResults.map((investor) => (
            <CompactInvestorCard
              key={investor.id}
              investor={investor}
              onLike={(id) => handleInvestorLikeDislike(id, "like")}
              onDislike={(id) => handleInvestorLikeDislike(id, "dislike")}
              isFavorite={favoriteInvestors.some((fav) => fav.id === investor.id)}
              isLoading={false} // Loading state not tracked on this page for simplicity
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center p-4">
          <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Investor Results</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Use the chat interface to search for investors. Your results will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
