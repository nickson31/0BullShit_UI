"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InvestorCard from "@/components/investor-card"
import EmployeeCard from "@/components/employee-card" // Assuming this component exists and is suitable
import UnwantedItemCard from "@/components/unwanted-item-card"
import { api } from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

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
  const projectId = "p1" // This should be dynamic in a real app

  const fetchSavedInvestors = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, investors: true }))
    try {
      const data = await api.getSavedItems(projectId, "investors")
      setSavedInvestors(data)
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch saved investors.", variant: "destructive" })
    } finally {
      setIsLoading((prev) => ({ ...prev, investors: false }))
    }
  }, [projectId, toast])

  const fetchSavedEmployees = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, employees: true }))
    try {
      const data = await api.getSavedItems(projectId, "employees")
      setSavedEmployees(data)
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch saved employees.", variant: "destructive" })
    } finally {
      setIsLoading((prev) => ({ ...prev, employees: false }))
    }
  }, [projectId, toast])

  const fetchUnwantedItems = useCallback(async () => {
    setIsLoading((prev) => ({ ...prev, unwanted: true }))
    try {
      const data = await api.getUnwantedItems(projectId)
      setUnwantedItems(data)
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch unwanted items.", variant: "destructive" })
    } finally {
      setIsLoading((prev) => ({ ...prev, unwanted: false }))
    }
  }, [projectId, toast])

  useEffect(() => {
    fetchSavedInvestors()
    fetchSavedEmployees()
    fetchUnwantedItems()
  }, [fetchSavedInvestors, fetchSavedEmployees, fetchUnwantedItems])

  const handleRemoveUnwanted = (sentimentId: string) => {
    setUnwantedItems((prev) => prev.filter((item) => item.id !== sentimentId))
  }

  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex justify-between mt-4">
                <div className="space-x-2">
                  <Skeleton className="h-8 w-16 inline-block" />
                  <Skeleton className="h-8 w-16 inline-block" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderContent = (
    key: "investors" | "employees" | "unwanted",
    data: any[],
    CardComponent: React.ElementType,
    cardProps: object = {},
  ) => {
    if (isLoading[key]) {
      return renderLoadingSkeletons()
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
