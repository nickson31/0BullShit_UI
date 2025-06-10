"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles } from "lucide-react"

interface DeepAnalysisCardProps {
  analysis: string
}

export default function DeepAnalysisCard({ analysis }: DeepAnalysisCardProps) {
  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Brain className="h-5 w-5" />
          Deep Analysis
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed">{analysis}</p>
        </div>
      </CardContent>
    </Card>
  )
}
