"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface GrowthUpsellCardProps {
  onUnlock: () => void
}

export default function GrowthUpsellCard({ onUnlock }: GrowthUpsellCardProps) {
  const features = [
    "Unlimited Mentorship", // As per user request, not in app.py
    "Investors Deep Research", // "Búsquedas ilimitadas de inversores" & "Análisis de compatibilidad avanzado"
    "Export results to Excel", // From app.py
    "Priority Support", // From app.py
  ]

  return (
    <div className="w-full p-5 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <span className="text-2xl mr-3 mt-0.5" role="img" aria-label="rocket">
          🚀
        </span>
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-1">Activate Growth Plan</h3>
          <p className="text-sm text-blue-700 mb-3">Unlock advanced features to supercharge your investor search.</p>
          <ul className="space-y-1.5 mb-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center text-sm text-blue-700">
                <CheckCircle className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-blue-800">29 €/month</p>
            <Button onClick={onUnlock} className="bg-blue-600 hover:bg-blue-700 text-white">
              Unlock Growth
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-2 text-right">Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
