"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { ChevronDown, ChevronUp, Users, Heart, X, Linkedin, FileText, MapPin } from "lucide-react" // Added Linkedin, FileText, MapPin
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import type { EmployeeResult } from "@/services/api"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Added Tooltip

interface EmployeeCardProps {
  employee: EmployeeResult
  onToggleFavorite: (employee: EmployeeResult) => void
  onDislikeAction: (employee: EmployeeResult) => void
  // Removed onGenerateTemplate as it will be handled by router push directly
  isFavorite: boolean
  isLoading: boolean
}

function EmployeeCardItem({ employee, onToggleFavorite, onDislikeAction, isFavorite, isLoading }: EmployeeCardProps) {
  const router = useRouter()

  const handleGenerateTemplateClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/templates?entityId=${employee.id}&entityType=employee`)
  }

  return (
    <div className="flex items-center justify-between p-3 border-t hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={employee.profilePic || "/placeholder.svg?width=32&height=32&query=user+avatar"}
            alt={employee.fullName}
          />
          <AvatarFallback>{employee.fullName?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{employee.fullName}</p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {employee.current_job_title || employee.headline}
          </p>
          {employee.location && (
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{employee.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-1 items-center flex-shrink-0">
        {employee.linkedinUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={employee.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 text-slate-500 hover:text-blue-600"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>LinkedIn</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGenerateTemplateClick}
              disabled={isLoading}
              className="h-7 w-7 p-0 text-slate-500 dark:text-slate-400 hover:text-primary"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Generate Template</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(employee)
              }}
              disabled={isLoading}
              className={cn(
                "h-7 w-7 p-0 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900",
                isFavorite ? "text-pink-500" : "text-slate-500 dark:text-slate-400",
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-pink-500" : "")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFavorite ? "Unlike Employee" : "Like Employee"}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onDislikeAction(employee)
              }}
              disabled={isLoading}
              className="h-7 w-7 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Dislike Employee</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

interface EmployeeFundCardProps {
  fundName: string
  employees: EmployeeResult[]
  onToggleFavorite: (employee: EmployeeResult) => void
  onDislikeAction: (employee: EmployeeResult) => void
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
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="w-full mb-4">
        <CardHeader
          className="py-3 px-4 flex flex-row items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Users className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <CardTitle className="text-base font-medium truncate">{fundName}</CardTitle>
            <Badge variant="outline" className="ml-2 flex-shrink-0">
              {employees.length} empleados
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="p-0 h-8 w-8 flex-shrink-0">
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
                    <EmployeeCardItem
                      key={employee.id}
                      employee={employee}
                      onToggleFavorite={onToggleFavorite}
                      onDislikeAction={onDislikeAction}
                      isFavorite={isEmployeeInFavorites(employee.id)}
                      isLoading={loadingStates[employee.id] || false}
                    />
                  ))}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </TooltipProvider>
  )
}
