"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InvestorCard from "@/components/investor-card"
import EmployeeCard from "@/components/employee-card" // Assuming this component exists and is suitable
import UnwantedItemCard from "@/components/unwanted-item-card"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

// Mock data types - replace with actual types from your project
type SavedInvestor = any
type SavedEmployee = any
type UnwantedItem = any

export default function FavouritesPage() {
  const [savedInvestors, setSavedInvestors] = useState<SavedInvestor[]>([])
  const [savedEmployees, setSavedEmployees] = useState<SavedEmployee[]>([])
  const [unwantedItems, setUnwantedItems] = useState<UnwantedItem[]>([])
  const [isLoading, setIsLoading] = useState({ investors: true, employees: true, unwanted: true })
  const { toast } = useToast()

  const fetchSavedInvestors = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, investors: true }))
    try {
      const data = await api.getSavedInvestors()
      setSavedInvestors(data)
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch saved investors.", variant: "destructive" })
    } finally {
      setIsLoading((prev) => ({ ...prev, investors: false }))
    }
  }, [toast])

  const fetchSavedEmployees = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, employees: true }))
    try {
      const data = await api.getSavedEmployees()
      setSavedEmployees(data)
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch saved employees.", variant: "destructive" })
    } finally {
      setIsLoading((prev) => ({ ...prev, employees: false }))
    }
  }, [toast])

  const fetchUnwantedItems = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, unwanted: true }))
    try {
      const data = await api.getUnwantedItems("p1") // Using placeholder project ID
      setUnwantedItems(data)
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch unwanted items.", variant: "destructive" })
    } finally {
      setIsLoading((prev) => ({ ...prev, unwanted: false }))
    }
  }, [toast])

  useEffect(() => {
    fetchSavedInvestors()
    fetchSavedEmployees()
    fetchUnwantedItems()
  }, [fetchSavedInvestors, fetchSavedEmployees, fetchUnwantedItems])

  const handleRemoveUnwanted = (sentimentId: string) => {
    setUnwantedItems((prev) => prev.filter((item) => item.id !== sentimentId))
  }

  const renderContent = (
    key: "investors" | "employees" | "unwanted",
    data: any[],
    CardComponent: React.ElementType,
    cardProps: object = {},
  ) => {
    if (isLoading[key]) {
      return <div className="text-center p-8">Loading...</div>
    }
    if (data.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">No items found.</div>
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <CardComponent key={item.id} {...item} {...cardProps} />
        ))}
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Saved & Unwanted Items</h1>

      <Tabs defaultValue="investors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investors">Saved Investors</TabsTrigger>
          <TabsTrigger value="employees">Saved Employees</TabsTrigger>
          <TabsTrigger value="unwanted">Unwanted Items</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="mt-6">
          {renderContent("investors", savedInvestors, InvestorCard, { showActions: false })}
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          {renderContent("employees", savedEmployees, EmployeeCard)}
        </TabsContent>

        <TabsContent value="unwanted" className="mt-6">
          {renderContent("unwanted", unwantedItems, UnwantedItemCard, {
            onRemove: handleRemoveUnwanted,
            item: undefined,
            item: (item: any) => item,
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
