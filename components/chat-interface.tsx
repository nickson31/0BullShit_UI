"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Plus, SendHorizontal, Sparkles, BrainCircuit } from "lucide-react"
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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isDeepResearch, setIsDeepResearch] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userName = "Nikita" // Placeholder, fetch dynamically in a real app

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputValue
    if (messageText.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      let botResponse: Message

      if (messageText.toLowerCase().includes("find investors")) {
        const sampleInvestor: Investor = {
          id: "inv123",
          Company_Name: "Innovate Capital",
          Company_Description:
            "Early-stage VC focused on disruptive technologies. We partner with visionary founders to build market-leading companies.",
          Investing_Stage: ["Seed", "Series A"],
          Company_Location: "San Francisco, CA",
          Investment_Categories: ["AI", "SaaS", "Fintech"],
          Company_Email: "contact@innovatecap.com",
          Company_Phone: "555-123-4567",
          Company_Linkedin: "linkedin.com/company/innovate-capital",
          Company_Website: "https://innovatecap.com",
          Score: "85.2",
        }
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: new Date(),
          component: "InvestorCard",
          componentProps: { investor: sampleInvestor },
        }
      } else if (messageText.toLowerCase().includes("growth plan")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: new Date(),
          component: "GrowthUpsellCard",
          componentProps: {},
        }
      } else if (messageText.toLowerCase().includes("outreach plan")) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: new Date(),
          component: "OutreachUpsellCard",
          componentProps: {},
        }
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: `0BullShit processed: "${messageText}". ${isDeepResearch ? "(Deep Research enabled)" : ""}`,
          sender: "bot",
          timestamp: new Date(),
        }
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    // Optionally send message immediately:
    // handleSendMessage(suggestion);
  }

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-5xl font-medium mb-6">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Hello, {userName}
            </span>
          </h1>
          <p className="text-slate-600 mb-10 text-lg">How can I help you today?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-16">
            {suggestionChips.slice(0, 2).map((chipText) => (
              <Button
                key={chipText}
                variant="outline"
                className="h-auto py-3 px-4 text-left text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-300 text-sm"
                onClick={() => handleSuggestionClick(chipText)}
              >
                {chipText}
                <Sparkles className="ml-auto h-4 w-4 text-slate-500" />
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3 w-full", // Ensure cards can take full width if needed
                  msg.sender === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.sender === "bot" &&
                  !msg.component && ( // Only show avatar for text bot messages
                    <Avatar className="h-8 w-8 border border-slate-200 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg?width=32&height=32" alt="0BullShit" />
                      <AvatarFallback>0B</AvatarFallback>
                    </Avatar>
                  )}
                <div
                  className={cn(
                    "max-w-[70%]", // Default max width for text messages
                    msg.sender === "user" ? "p-3 rounded-xl shadow-sm bg-blue-500 text-white rounded-br-none" : "",
                    msg.sender === "bot" && !msg.component
                      ? "p-3 rounded-xl shadow-sm bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                      : "",
                    msg.sender === "bot" && msg.component ? "w-full" : "", // Allow components to take more width
                  )}
                >
                  {msg.component === "InvestorCard" && msg.componentProps?.investor && (
                    <InvestorCard investor={msg.componentProps.investor} />
                  )}
                  {msg.component === "GrowthUpsellCard" && (
                    <GrowthUpsellCard onUnlock={() => console.log("Unlock Growth clicked")} />
                  )}
                  {msg.component === "OutreachUpsellCard" && (
                    <OutreachUpsellCard onUnlock={() => console.log("Unlock Outreach clicked")} />
                  )}
                  {msg.text &&
                    (typeof msg.text === "string" ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      msg.text
                    ))}

                  {!msg.component && ( // Only show timestamp for text messages directly
                    <p
                      className={cn(
                        "text-xs mt-1.5",
                        msg.sender === "user" ? "text-blue-200 text-right" : "text-slate-500 text-left",
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?width=32&height=32" alt={userName} />
                    <AvatarFallback>{userName.substring(0, 1)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center p-1 bg-slate-100 rounded-xl shadow-sm border border-slate-200">
            <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-200 rounded-full ml-1">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Attach file</span>
            </Button>
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask 0BullShit..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-32 py-2 px-3 text-sm"
              rows={1}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSendMessage()}
              disabled={inputValue.trim() === ""}
              className="text-blue-600 hover:bg-blue-100 rounded-full mr-1 disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <div className="flex items-center justify-end mt-2.5 space-x-3 pr-1">
            <div className="flex items-center space-x-1.5">
              <Switch
                id="deep-research"
                checked={isDeepResearch}
                onCheckedChange={setIsDeepResearch}
                className="data-[state=checked]:bg-blue-600"
              />
              <Label htmlFor="deep-research" className="text-xs text-slate-600 flex items-center">
                <BrainCircuit className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                Deep Research
              </Label>
            </div>
            <p className="text-xs text-slate-500">
              0BullShit can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
