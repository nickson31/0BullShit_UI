'use client'

import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { motion } from 'framer-motion'

export default function EmployeeDetail() {
  const { selectedEmployee, updateEmployeeScore } = useApp()

  if (!selectedEmployee) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select an employee to view details
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {selectedEmployee.fullName?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{selectedEmployee.fullName}</CardTitle>
              <p className="text-muted-foreground">{selectedEmployee.headline}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Current Position */}
            <div>
              <h3 className="font-semibold mb-2">Current Position</h3>
              <p>{selectedEmployee.current_job_title} at {selectedEmployee.current_company_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedEmployee.current_company_industry} • {selectedEmployee.current_company_size} employees
              </p>
              <p className="text-sm text-muted-foreground">
                Duration: {selectedEmployee.current_job_duration_years}
              </p>
            </div>

            {/* Experience */}
            <div>
              <h3 className="font-semibold mb-2">Previous Experience</h3>
              {[0, 1, 2].map(i => {
                const company = selectedEmployee[`experience_${i}_company` as keyof typeof selectedEmployee]
                const title = selectedEmployee[`experience_${i}_title` as keyof typeof selectedEmployee]
                const duration = selectedEmployee[`experience_${i}_duration_years` as keyof typeof selectedEmployee]
                const location = selectedEmployee[`experience_${i}_location` as keyof typeof selectedEmployee]

                if (!company) return null

                return (
                  <div key={i} className="mb-3">
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      {company} • {duration} • {location}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Education */}
            <div>
              <h3 className="font-semibold mb-2">Education</h3>
              {[0, 1].map(i => {
                const degree = selectedEmployee[`education_${i}_degree` as keyof typeof selectedEmployee]
                const institution = selectedEmployee[`education_${i}_institution` as keyof typeof selectedEmployee]

                if (!degree) return null

                return (
                  <div key={i} className="mb-2">
                    <p>{degree}</p>
                    <p className="text-sm text-muted-foreground">{institution}</p>
                  </div>
                )
              })}
            </div>

            {/* Decision Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Decision Score</h3>
                <Badge variant={selectedEmployee.decision_score && selectedEmployee.decision_score > 7 ? 'success' : 'secondary'}>
                  {selectedEmployee.decision_score || 'N/A'}
                </Badge>
              </div>
              <Slider
                defaultValue={[selectedEmployee.decision_score || 5]}
                max={10}
                step={1}
                onValueChange={([value]) => updateEmployeeScore(selectedEmployee.id, value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
