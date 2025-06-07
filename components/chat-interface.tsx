"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, SendHorizontal, Sparkles, BrainCircuit, Send, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import InvestorCard, { type Investor } from "@/components/investor-card"
import GrowthUpsellCard from "@/components/growth-upsell-card"
import OutreachUpsellCard from "@/components/outreach-upsell-card"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Message {
  id: string
  text?: string | React.ReactNode // Make text optional
  sender: "user" | "bot"
  timestamp: Date
  component?: "InvestorCard" | "GrowthUpsellCard" | "OutreachUpsellCard" // Add component type
  componentProps?: any // Props for the component
}

const initialMessages: Message[] = [] // Start with no messages for initial view

const suggestionChips = [
  "Draft an email to a potential investor",
  "What are common pitfalls in early-stage funding?",
  "Summarize this pitch deck for me",
  "Find VCs interested in SaaS startups",
]

export function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI fundraising assistant. I'll help you prepare your pitch and find the right investors. What's your startup about?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages([
      ...messages,
      { role: "user", content: input },
    ])
    setInput("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === "assistant" ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "assistant"
                  ? "bg-gray-100"
                  : "bg-blue-600 text-white"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Button type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
