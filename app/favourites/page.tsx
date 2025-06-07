'use client'

import InvestorCard from "@/components/investor-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FavouritesPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Saved Items</h1>
      
      <Tabs defaultValue="investors" className="w-full">
        <TabsList>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="unwanted">Unwanted</TabsTrigger>
        </TabsList>
        
        <TabsContent value="investors" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InvestorCard
              id="1"
              projectId="p1"
              name="Ana Soler"
              company="Climate Seed"
              location="Madrid"
              investingStage="Series A"
              categories={["retail-energy"]}
              score="85"
            />
            <InvestorCard
              id="2"
              projectId="p1"
              name="Jordi Ferré"
              company="GreenSprout Angels"
              location="Barcelona"
              investingStage="Seed"
              categories={["ex-CEO retail"]}
              score="92"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="unwanted" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Unwanted investors will be shown here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 