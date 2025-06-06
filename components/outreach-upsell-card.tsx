"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface OutreachUpsellCardProps {
  onUnlock: () => void
}

export default function OutreachUpsellCard({ onUnlock }: OutreachUpsellCardProps) {
  const features = [
    "VC Funds Employee Scraping", // User specified, not directly in app.py text but implied by "LinkedIn"
    "Generate Templates with 0Bullshit", // "Plantillas de email personalizadas" & "Mensajes de LinkedIn optimizados"
    "Send Automatically with your Linkedin Account", // Implied by "Seguimiento automático" & "CRM integrado"
    "Response Analytics", // From app.py
    "Integrated CRM", // From app.py
  ]

  return (
    <div className="w-full p-5 bg-green-50 border-l-4 border-green-600 rounded-r-lg shadow-sm">
      <div className="flex items-start">
        <span className="text-2xl mr-3 mt-0.5" role="img" aria-label="briefcase">
          💼
        </span>
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-1">Automate your Outreach</h3>
          <p className="text-sm text-green-700 mb-3">
            Efficiently connect with investors using powerful outreach tools.
          </p>
          <ul className="space-y-1.5 mb-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center text-sm text-green-700">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-green-800">89 €/month</p> {/* Updated price as per user request */}
            <Button onClick={onUnlock} className="bg-green-600 hover:bg-green-700 text-white">
              Unlock Outreach
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-2 text-right">ROI guaranteed</p>
        </div>
      </div>
    </div>
  )
}
