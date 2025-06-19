"use client"

import { CardFooter } from "@/components/ui/card"

import { Coins, CheckCircle, History, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp } from "@/contexts/AppContext"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

// Mock data for credit history and plans
interface CreditTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: "purchase" | "usage" | "bonus"
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  features: string[]
  isCurrent?: boolean
}

const mockCreditHistory: CreditTransaction[] = [
  { id: "t1", date: "2024-06-15", description: "Initial Free Credits", amount: 100, type: "bonus" },
  { id: "t2", date: "2024-06-16", description: "Investor Search (5 credits)", amount: -5, type: "usage" },
  { id: "t3", date: "2024-06-17", description: "Deep Analysis (10 credits)", amount: -10, type: "usage" },
  { id: "t4", date: "2024-06-18", description: "Purchased 500 credits", amount: 500, type: "purchase" },
]

const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "€",
    features: ["Basic Investor Search", "Limited Chat Interactions", "1 Project"],
    isCurrent: true, // This will be dynamically set based on user profile
  },
  {
    id: "growth",
    name: "Growth",
    price: 29,
    currency: "€",
    features: ["Unlimited Investor Search", "Advanced Filters", "Deep Analysis", "5 Projects"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 89,
    currency: "€",
    features: ["All Growth Features", "Automated Outreach Tools", "Unlimited Projects", "Priority Support"],
  },
]

export default function CreditsPage() {
  const { profile, credits, isLoadingProfile } = useApp()
  const { toast } = useToast()

  const plansWithCurrentStatus = mockSubscriptionPlans.map((plan) => ({
    ...plan,
    isCurrent: profile?.subscription_plan === plan.id,
  }))

  const handleUpgrade = (planId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `Upgrading to ${planId} plan is under development.`,
    })
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Credits & Plan</h1>
      </div>

      {isLoadingProfile ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-yellow-500" />
                Current Credit Balance
              </CardTitle>
              <CardDescription>Your available credits for AI interactions and searches.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-center">{credits?.toLocaleString() ?? 0}</p>
              <p className="text-sm text-muted-foreground text-center mt-2">credits remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6 text-slate-500" />
                Credit History
              </CardTitle>
              <CardDescription>Recent transactions and credit usage.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockCreditHistory.length === 0 ? (
                <p className="text-center text-muted-foreground">No credit history available.</p>
              ) : (
                <div className="space-y-2">
                  {mockCreditHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                      <span className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-500" />
                Subscription Plans
              </CardTitle>
              <CardDescription>Choose the plan that best fits your needs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plansWithCurrentStatus.map((plan) => (
                <Card
                  key={plan.id}
                  className={`flex flex-col ${plan.isCurrent ? "border-2 border-blue-500 shadow-lg" : ""}`}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>
                      {plan.price === 0 ? "Free" : `${plan.price} ${plan.currency}/month`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    {plan.isCurrent ? (
                      <Button variant="secondary" disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Button onClick={() => handleUpgrade(plan.id)} className="w-full">
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
