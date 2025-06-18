import { Coins } from "lucide-react"

export default function CreditsPage() {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Credits & Plan</h1>
      </div>
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
        <Coins className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">Credit Management</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View your credit balance and manage your plan. This feature is under construction.
        </p>
      </div>
    </div>
  )
}
