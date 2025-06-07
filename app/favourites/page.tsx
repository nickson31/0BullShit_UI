import { InvestorCard } from "@/components/investor-card"
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
            {/* Example cards - will be populated from backend */}
            <InvestorCard
              name="Ana Soler"
              company="Climate Seed"
              location="Madrid"
              focus="retail-energy"
              isFavorite={true}
            />
            <InvestorCard
              name="Jordi Ferré"
              company="GreenSprout Angels"
              location="Barcelona"
              focus="ex-CEO retail"
              isFavorite={true}
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