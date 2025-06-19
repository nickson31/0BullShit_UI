"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type CreditTransaction, type SubscriptionPlanDetails } from "@/services/api"
import { Coins, CheckCircle, History, Zap, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

export default function CreditsPage() {
  const { toast } = useToast()
  const { profile, credits: appContextCredits, isLoadingProfile: isLoadingAppUser, fetchProfileAndProjects } = useApp()

  const [creditBalance, setCreditBalance] = useState<number>(appContextCredits)
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(profile?.subscription_plan || null)
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([])
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlanDetails[]>([])

  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null) // Store ID of plan being upgraded to

  const fetchCreditData = useCallback(async () => {
    if (!profile) return // Ensure profile is loaded
    setIsLoadingBalance(true)
    setIsLoadingHistory(true)
    setIsLoadingPlans(true)
    try {
      const [balanceRes, historyRes, plansRes] = await Promise.all([
        api.getCreditBalance(),
        api.getCreditHistory(), // Simulated
        api.getSubscriptionPlans(), // Simulated
      ])
      setCreditBalance(balanceRes.credits)
      setCurrentPlanId(balanceRes.plan)
      setCreditHistory(historyRes.transactions)
      setSubscriptionPlans(plansRes)
    } catch (error) {
      toast({ title: "Error Fetching Credit Data", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsLoadingBalance(false)
      setIsLoadingHistory(false)
      setIsLoadingPlans(false)
    }
  }, [profile, toast])

  useEffect(() => {
    if (!isLoadingAppUser && profile) {
      fetchCreditData()
    } else if (!isLoadingAppUser && !profile) {
      // User logged out or error
      setCreditBalance(0)
      setCurrentPlanId("free") // Default to free if no profile
    }
  }, [isLoadingAppUser, profile, fetchCreditData])

  // Update local state if context changes (e.g., after an API call that uses credits)
  useEffect(() => {
    setCreditBalance(appContextCredits)
  }, [appContextCredits])

  useEffect(() => {
    if (profile) setCurrentPlanId(profile.subscription_plan)
  }, [profile])

  const handleUpgrade = async (planId: "growth" | "pro") => {
    setIsUpgrading(planId)
    try {
      const response = await api.upgradeSubscription({ plan: planId })
      toast({ title: "Subscription Upgraded!", description: response.message })
      await fetchProfileAndProjects() // Refetch profile to update plan and credits in context
      await fetchCreditData() // Refetch page-specific data
    } catch (error) {
      toast({ title: "Upgrade Failed", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsUpgrading(null)
    }
  }

  const isLoading = isLoadingAppUser || isLoadingBalance || isLoadingHistory || isLoadingPlans

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Credits & Plan</h1>
        <Button onClick={() => toast({ title: "Buy More Credits", description: "Coming soon!" })}>
          <Coins className="mr-2 h-4 w-4" /> Buy More Credits
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Balance Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white dark:from-blue-700 dark:to-indigo-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Coins className="h-7 w-7" />
              Current Credit Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {isLoadingBalance || isLoadingAppUser ? (
              <Skeleton className="h-16 w-48 mx-auto bg-white/20 rounded-md" />
            ) : (
              <p className="text-6xl font-bold">{creditBalance.toLocaleString()}</p>
            )}
            <p className="text-lg opacity-80 mt-1">credits remaining</p>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs opacity-70">
              Your current plan:
              <span className="font-semibold ml-1 capitalize">
                {isLoadingAppUser || isLoadingPlans ? (
                  <Skeleton className="h-4 w-16 inline-block bg-white/20" />
                ) : (
                  currentPlanId || "Free"
                )}
              </span>
            </p>
          </CardFooter>
        </Card>

        {/* Credit History Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <History className="h-5 w-5 text-slate-500" />
              Credit History
            </CardTitle>
            <CardDescription>Recent transactions and credit usage.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory || isLoadingAppUser ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : creditHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No credit history available.</p>
            ) : (
              <div className="h-[220px] pr-3 overflow-auto">
                <div className="space-y-3">
                  {creditHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex justify-between items-center border-b pb-2.5 last:border-b-0 last:pb-0 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "MMM d, yyyy - h:mm a")}
                        </p>
                      </div>
                      <span
                        className={`font-semibold text-base ${tx.type === "credit" || tx.amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {tx.type === "credit" || tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans Section */}
      <div className="mt-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Subscription Plans</h2>
          <p className="text-md text-muted-foreground max-w-xl mx-auto">
            Choose the plan that best fits your needs and unlock powerful features to accelerate your success.
          </p>
        </div>
        {isLoadingPlans || isLoadingAppUser ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-2 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col transition-all duration-300 hover:shadow-xl ${plan.id === currentPlanId ? "border-2 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/50 dark:ring-blue-500/50 shadow-2xl" : "bg-slate-50 dark:bg-slate-800/60"}`}
              >
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold mb-1 text-slate-800 dark:text-slate-100">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    €{plan.price_monthly}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.credits_monthly.toLocaleString()} credits/month
                  </p>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <ul className="space-y-2.5 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="mr-2.5 mt-0.5 h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-4 pt-4 border-t dark:border-slate-700">
                  {plan.id === currentPlanId ? (
                    <Button variant="secondary" disabled className="w-full font-semibold">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id as "growth" | "pro")}
                      className="w-full font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                      disabled={isUpgrading === plan.id || plan.id === "free"} // Can't "upgrade" to free
                    >
                      {isUpgrading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="mr-2 h-4 w-4" />
                      )}
                      {plan.id === "free" ? "Your Plan" : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Need more?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              toast({ title: "Contact Sales", description: "Enterprise solutions are available." })
            }}
            className="underline hover:text-primary"
          >
            Contact Sales
          </a>{" "}
          for enterprise solutions.
        </p>
      </div>
    </div>
  )
}
