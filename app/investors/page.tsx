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

  const handleInvestorToggleFavorite = useCallback(
    async (investorId: string) => {
      // setActionLoadingStates((prev) => ({ ...prev, [investorId]: true })) // If you add loading states here
      const investor =
        lastInvestorResults.find((inv) => inv.id === investorId) ||
        favoriteInvestors.find((inv) => inv.id === investorId)

      if (!investor) {
        toast({ title: "Error", description: "Investor not found.", variant: "destructive" })
        // setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
        return
      }

      const currentIsFavorite = favoriteInvestors.some((fav) => fav.id === investorId)

      try {
        if (currentIsFavorite) {
          await api.updateInvestorSentiment(investorId, "dislike")
          removeFromFavorites(investorId, "investor")
          toast({ title: "Investor Unliked", description: `${investor.Company_Name} removed from favorites.` })
        } else {
          await api.updateInvestorSentiment(investorId, "like")
          addToFavorites(investor, "investor")
          toast({ title: "Investor Liked", description: `${investor.Company_Name} added to favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        // setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
      }
    },
    [addToFavorites, removeFromFavorites, toast, lastInvestorResults, favoriteInvestors],
  )

  const handleInvestorDislikeAction = useCallback(
    async (investorId: string) => {
      // setActionLoadingStates((prev) => ({ ...prev, [investorId]: true }))
      const investor =
        lastInvestorResults.find((inv) => inv.id === investorId) ||
        favoriteInvestors.find((inv) => inv.id === investorId)

      if (!investor) {
        // setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
        return
      }

      try {
        await api.updateInvestorSentiment(investorId, "dislike")
        removeFromFavorites(investorId, "investor")
        toast({ title: "Investor Disliked", description: `${investor.Company_Name} marked as disliked.` })
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        // setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
      }
    },
    [removeFromFavorites, toast, lastInvestorResults, favoriteInvestors],
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
              onToggleFavorite={handleInvestorToggleFavorite} // Updated
              onDislikeAction={handleInvestorDislikeAction} // Updated
              isFavorite={favoriteInvestors.some((fav) => fav.id === investor.id)}
              isLoading={false} // Add loading state if desired for this page
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
