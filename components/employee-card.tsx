import { Star, Building2, Briefcase, Linkedin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Employee } from "@/types"

interface EmployeeCardProps extends Employee {
  onFavoriteToggle?: () => void;
}

export function EmployeeCard({
  name,
  position,
  company,
  linkedIn,
  isFavorite,
  onFavoriteToggle,
}: EmployeeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onFavoriteToggle}
          className={isFavorite ? "text-yellow-500" : "text-gray-400"}
        >
          <Star className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Briefcase className="mr-2 h-4 w-4" />
            {position}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="mr-2 h-4 w-4" />
            {company}
          </div>
          <a
            href={`https://linkedin.com/in/${linkedIn}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:underline"
          >
            <Linkedin className="mr-2 h-4 w-4" />
            LinkedIn Profile
          </a>
        </div>
      </CardContent>
    </Card>
  )
} 