"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Users, Heart, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import type { EmployeeResult } from "@/services/api"
import { cn } from "@/lib/utils"

interface EmployeeFundCardProps {
  fundName: string
  employees: EmployeeResult[]
  onToggleFavorite: (employee: EmployeeResult) => void // New prop
  onDislikeAction: (employee: EmployeeResult) => void // New prop
  isEmployeeInFavorites: (id: string) => boolean
  loadingStates: Record<string, boolean>
}

export default function EmployeeFundCard({
  fundName,
  employees,
  onToggleFavorite,
  onDislikeAction,
  isEmployeeInFavorites,
  loadingStates,
}: EmployeeFundCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="w-full mb-4">
      <CardHeader
        className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-base font-medium">{fundName}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {employees.length} empleados
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 px-0">
              <div className="max-h-[300px] overflow-y-auto">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 border-t hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.profilePic || "/placeholder.svg"} alt={employee.fullName} />
                        <AvatarFallback>{employee.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{employee.fullName}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {employee.current_job_title || employee.headline}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(employee) // Updated
                        }}
                        disabled={loadingStates[employee.id]}
                        className={cn(
                          "h-7 w-7 p-0 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900",
                          isEmployeeInFavorites(employee.id) ? "text-pink-500" : "text-slate-500 dark:text-slate-400",
                        )}
                        title={isEmployeeInFavorites(employee.id) ? "Unlike Employee" : "Like Employee"}
                      >
                        <Heart className={cn("h-4 w-4", isEmployeeInFavorites(employee.id) ? "fill-pink-500" : "")} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDislikeAction(employee) // Updated
                        }}
                        disabled={loadingStates[employee.id]} // Removed '|| isEmployeeInFavorites(employee.id)'
                        className="h-7 w-7 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Dislike Employee"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
