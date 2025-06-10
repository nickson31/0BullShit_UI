"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { SendHorizontal, Sparkles, Plus, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import InvestorResultsTable from "@/components/investor-results-table"
import GrowthUpsellCard from "@/components/growth-upsell-card"
import OutreachUpsellCard from "@/components/outreach-upsell-card"
import { useToast } from "@/components/ui/use-toast"
import { api, type ChatResponseType } from "@/services/api"

interface Message {
  id: string
  text?: string | React.ReactNode
  sender: "user" | "bot"
  timestamp: Date
  rawApiResponse?: ChatResponseType
}

const initialMessages: Message[] = []

const suggestionChipsData = [
  { text: "Draft an email to a potential investor", icon: Sparkles },
  { text: "What are common pitfalls in early-stage funding?", icon: Sparkles },
]

export default function ChatInterface({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isDeepResearch, setIsDeepResearch] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userName = "Nikita" // Placeholder
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue
    if (messageText.trim() === "" || isLoading) return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Use the correct chat endpoint with just message
      const apiResponse = await api.chat({
        message: messageText,
      })

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        timestamp: new Date(),
        rawApiResponse: apiResponse,
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorResponseMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        timestamp: new Date(),
        text: `Error: ${(error as Error).message || "Failed to get response from 0Bullshit."}`,
      }
      setMessages((prev) => [...prev, errorResponseMessage])
      toast({
        title: "API Error",
        description: (error as Error).message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderBotMessageContent = (response: ChatResponseType) => {
    switch (response.type) {
      case "onboarding_question":
      case "text_response":
      case "sentiment_saved":
      case "plan_confirmed":
      case "error":
        return <p className="text-sm whitespace-pre-wrap">{response.content}</p>
      case "plan_upsell":
        if (response.plan === "Growth") {
          return <GrowthUpsellCard onUnlock={() => handleSendMessage(`Activate ${response.plan} plan`)} />
        }
        if (response.plan === "Outreach") {
          return <OutreachUpsellCard onUnlock={() => handleSendMessage(`Activate ${response.plan} plan`)} />
        }
        return <p className="text-sm whitespace-pre-wrap">{response.content}</p>
      case "investor_results":
        return (
          <>
            {response.message && <p className="text-sm mb-2 whitespace-pre-wrap">{response.message}</p>}
            <InvestorResultsTable investors={response.content} projectId={projectId} />
          </>
        )
      case "outreach_template":
        return (
          <div className="text-sm space-y-2">
            {response.message && <p className="mb-2 whitespace-pre-wrap">{response.message}</p>}
            <pre className="bg-slate-200 dark:bg-slate-700 p-3 rounded-md whitespace-pre-wrap font-mono text-xs">
              {response.content.content}
            </pre>
          </div>
        )
      case "outreach_activated":
        return (
          <div className="text-sm space-y-2">
            <p className="whitespace-pre-wrap">{response.content}</p>
            {response.next_steps && (
              <ul className="list-disc list-inside pl-4">
                {response.next_steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )
      default:
        return <p className="text-sm whitespace-pre-wrap">Received an unhandled message type.</p>
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-5xl font-medium mb-4">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Hello, {userName}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">How can I help you today?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
            {suggestionChipsData.map((chip) => (
              <Button
                key={chip.text}
                variant="outline"
                className="h-auto py-3 px-4 text-left text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-sm rounded-lg"
                onClick={() => handleSuggestionClick(chip.text)}
              >
                {chip.text}
                <chip.icon className="ml-auto h-4 w-4 text-slate-500 dark:text-slate-400" />
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex items-start gap-3 w-full", msg.sender === "user" ? "justify-end" : "justify-start")}
              >
                {msg.sender === "bot" && (
                  <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?width=32&height=32" alt="0BullShit" />
                    <AvatarFallback>0B</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[calc(100%-4rem)]",
                    msg.sender === "user" ? "p-3 rounded-xl shadow-sm bg-blue-600 text-white rounded-br-none" : "",
                    msg.sender === "bot"
                      ? "p-3 rounded-xl shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700"
                      : "",
                    msg.sender === "bot" && msg.rawApiResponse?.type === "investor_results" ? "w-full" : "",
                  )}
                >
                  {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                  {msg.rawApiResponse && renderBotMessageContent(msg.rawApiResponse)}

                  <p
                    className={cn(
                      "text-xs mt-1.5",
                      msg.sender === "user"
                        ? "text-blue-200 text-right"
                        : "text-slate-500 dark:text-slate-400 text-left",
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder.svg?width=32&height=32" alt={userName} />
                    <AvatarFallback>{userName.substring(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg?width=32&height=32" alt="0BullShit" />
                  <AvatarFallback>0B</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-xl shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700">
                  <div className="flex space-x-1.5 items-center">
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0s" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <div className="px-4 sm:px-0 pb-3 pt-2 bg-white dark:bg-slate-900">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2">
          <div className="flex items-end">
            <TextareaAutosize
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask 0BullShit..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none resize-none min-h-[24px] py-2.5 px-3 text-sm"
              minRows={1}
              maxRows={6}
              style={{ minHeight: "44px" }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSendMessage()}
              disabled={inputValue.trim() === "" || isLoading}
              className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent"
              aria-label="Send message"
            >
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full w-8 h-8"
                aria-label="Upload file"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full w-8 h-8"
                aria-label="Use microphone"
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                variant={isDeepResearch ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsDeepResearch(!isDeepResearch)}
                className={cn(
                  "rounded-full px-3 py-1 h-8 text-xs",
                  isDeepResearch
                    ? "bg-blue-100 dark:bg-blue-700 text-blue-600 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
                )}
                aria-label="Toggle Deep Research"
                aria-pressed={isDeepResearch}
              >
                Deep Research
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
