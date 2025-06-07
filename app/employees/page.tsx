import { EmployeeList } from '@/components/employees/EmployeeList'
import { EmployeeDetail } from '@/components/employees/EmployeeDetail'
import { Input } from '@/components/ui/input'
import { useApp } from '@/contexts/AppContext'

export default function EmployeesPage() {
  const { searchEmployees } = useApp()

  return (
    <div className="flex h-full">
      <div className="w-1/2 border-r">
        <div className="p-4 border-b">
          <Input 
            placeholder="Search employees..." 
            onChange={(e) => searchEmployees(e.target.value)}
          />
        </div>
        <EmployeeList />
      </div>
      <div className="w-1/2">
        <EmployeeDetail />
      </div>
    </div>
  )
} 