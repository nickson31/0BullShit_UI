import { InvestorCard } from "@/components/investor-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function InvestorsPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Investors</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search investors..." 
              className="pl-10 w-[300px]"
            />
          </div>
          <Button>Filter</Button>
        </div>
      </div>

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
          isFavorite={false}
        />
        <InvestorCard
          name="Patricia Marín"
          company="Impacto Norte"
          location="Bilbao"
          focus="ticket medio 150k €"
          isFavorite={false}
        />
      </div>
    </div>
  )
} 