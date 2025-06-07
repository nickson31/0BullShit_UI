'use client'

import { useApp } from '@/contexts/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

export function EmployeeList() {
  const { employees, loading, error, selectEmployee } = useApp()

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
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
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer" 
                onClick={() => selectEmployee(employee)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {employee.fullName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{employee.fullName}</h3>
                    <Badge variant={employee.decision_score && employee.decision_score > 7 ? 'success' : 'secondary'}>
                      Score: {employee.decision_score || 'N/A'}
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