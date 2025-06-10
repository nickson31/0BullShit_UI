"use client"

import { useApp } from "@/contexts/AppContext"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmployeeList() {
  const { employees, loading, error, selectEmployee } = useApp()

  if (loading) {
    return (
      <div className="grid gap-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  return (
    <div className="grid gap-4 p-4">
      {employees.map((employee, i) => (
        <motion.div
          key={employee.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card
            className="hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => selectEmployee(employee)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {employee.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{employee.fullName}</h3>
                    <Badge variant={employee.decision_score && employee.decision_score > 7 ? "success" : "secondary"}>
                      Score: {employee.decision_score || "N/A"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{employee.current_job_title}</p>
                  <p className="text-sm text-muted-foreground">{employee.current_company_name}</p>

                  {employee.experience_0_company && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Previous: </span>
                      {employee.experience_0_title} at {employee.experience_0_company}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
