"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface AILoadingStateProps {
  type: "deep-research" | "employee-search"
  onComplete: () => void
}

export default function AILoadingState({ type, onComplete }: AILoadingStateProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const deepResearchSteps = [
    "Analyzing 50,000+ investment funds...",
    "Applying advanced compatibility algorithms...",
    "Generating market insights...",
    "Calculating risk factors...",
    "Filtering by investment criteria...",
    "Ranking potential matches...",
  ]

  const employeeSearchSteps = [
    "Identifying relevant funds...",
    "Analyzing decision maker profiles...",
    "Filtering by quality score > 44...",
    "Mapping contact network...",
    "Evaluating outreach potential...",
  ]

  const steps = type === "deep-research" ? deepResearchSteps : employeeSearchSteps
  const totalDuration = type === "deep-research" ? 10000 : 6500 // 10s for deep research, 6.5s for employee search
  const stepDuration = totalDuration / steps.length

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          setTimeout(onComplete, 500) // Small delay before completing
          return 100
        }
        return newProgress
      })
    }, totalDuration / 100)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const newStep = prev + 1
        if (newStep >= steps.length) {
          clearInterval(stepInterval)
          return prev
        }
        return newStep
      })
    }, stepDuration)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [steps.length, stepDuration, totalDuration, onComplete])

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {type === "deep-research" ? "Deep Research in Progress" : "Advanced Employee Search"}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{progress}%</span>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center text-sm ${
              index <= currentStep ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <div
              className={`mr-2 h-2 w-2 rounded-full ${
                index < currentStep
                  ? "bg-green-500"
                  : index === currentStep
                    ? "bg-blue-500 animate-pulse"
                    : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}
