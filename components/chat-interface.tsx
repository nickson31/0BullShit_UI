"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { SendHorizontal, Sparkles, Mic, Loader2, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type ChatResponseType, type InvestorResult, type EmployeeResult } from "@/services/api"
import TextareaAutosize from "react-textarea-autosize"
import { cn } from "@/lib/utils" // Ensure cn is imported
import DeepAnalysisCard from "./deep-analysis-card" // Assuming this exists

interface Message {
  id: string
  text?: string | React.ReactNode // Can be string or custom ReactNode for rich content
  sender: "user" | "bot"
  timestamp: Date
  rawApiResponse?: ChatResponseType // Store raw API response for complex rendering
  // Specific result types for easier handling in renderBotMessageContent
  investorResults?: InvestorResult[]
  employeeResults?: EmployeeResult[]
  deepAnalysis?: string
  isError?: boolean
}

const initialMessages: Message[] = []

const suggestionChipsData = [
  { text: "Find investors for my fintech startup", icon: Sparkles },
  { text: "Search employees at Sequoia Capital", icon: Sparkles },
  { text: "Draft a pitch deck outline", icon: Sparkles },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const {
    profile,
    currentProject,
    setLastInvestorResults,
    setLastEmployeeResults,
    setLastDeepAnalysis,
    fetchProfileAndProjects, // To refresh credits after use
  } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("") // For dynamic loading messages
  const [progressValue, setProgressValue] = useState(0) // For progress bar
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressAnimationRef = useRef<number | null>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages, isLoading]) // Also scroll when isLoading changes (new loading message appears)

  const simulateLoadingProcess = useCallback((botName?: string) => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)

    const messages = botName
      ? [`Engaging ${botName}...`, "Analyzing context...", "Cross-referencing data...", "Generating insights..."]
      : ["Processing your request...", "Thinking...", "Almost there..."]
    const duration = botName ? 5000 : 3000 // Longer for specific bot
    const messageIntervalTime = duration / messages.length
    let currentMessageIndex = 0
    const progressStartTime = performance.now()

    setLoadingMessage(messages[0])
    setProgressValue(0)

    const animateProgress = (timestamp: number) => {
      const elapsed = timestamp - progressStartTime
      const calculatedProgress = Math.min((elapsed / duration) * 100, 100)
      setProgressValue(calculatedProgress)
      if (elapsed < duration) {
        progressAnimationRef.current = requestAnimationFrame(animateProgress)
      } else {
        setProgressValue(100)
      }
    }
    progressAnimationRef.current = requestAnimationFrame(animateProgress)

    loadingIntervalRef.current = setInterval(() => {
      currentMessageIndex++
      if (currentMessageIndex < messages.length) {
        setLoadingMessage(messages[currentMessageIndex])
      } else {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
      }
    }, messageIntervalTime)

    return () => {
      // Cleanup function
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)
      setLoadingMessage("")
      setProgressValue(0)
    }
  }, [])

  const handleSendMessage = useCallback(
    async (text?: string) => {
      const messageText = text || inputValue
      if (messageText.trim() === "" || isLoading) return

      if (!currentProject) {
        toast({
          title: "No Project Selected",
          description: "Please select or create a project before starting a chat.",
          variant: "destructive",
        })
        return
      }

      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        text: messageText,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newUserMessage])
      if (!text) setInputValue("")

      setIsLoading(true)
      const cleanupLoadingProcess = simulateLoadingProcess()

      try {
        const apiResponse = await api.chat({ message: messageText, project_id: currentProject.id })
        cleanupLoadingProcess() // Stop simulation once response is received

        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          timestamp: new Date(),
          rawApiResponse: apiResponse,
        }

        if (apiResponse.error) {
          // Handle specific error from backend bot response
          botMessage.text = apiResponse.error
          botMessage.isError = true
          if (apiResponse.required && apiResponse.available !== undefined) {
            botMessage.text += ` (Required: ${apiResponse.required}, Available: ${apiResponse.available})`
          }
        } else if (apiResponse.bot && apiResponse.response) {
          // Standard bot response
          botMessage.text = apiResponse.response
          // Potentially parse apiResponse.response if it's JSON stringified complex data
        } else if (apiResponse.type === "investor_results_normal" || apiResponse.type === "investor_results_deep") {
          botMessage.investorResults = apiResponse.search_results.results
          setLastInvestorResults(apiResponse.search_results.results)
          if (apiResponse.type === "investor_results_deep" && apiResponse.search_results.deep_analysis) {
            botMessage.deepAnalysis = apiResponse.search_results.deep_analysis
            setLastDeepAnalysis(apiResponse.search_results.deep_analysis)
          }
          botMessage.text = `Found ${apiResponse.search_results.results.length} investors.` // Placeholder text
        } else if (apiResponse.type === "employee_results") {
          botMessage.employeeResults = apiResponse.search_results.employees
          setLastEmployeeResults(apiResponse.search_results.employees)
          botMessage.text = `Found ${apiResponse.search_results.employees.length} employees.` // Placeholder text
        } else if (apiResponse.type === "text_response") {
          botMessage.text = apiResponse.content
        } else if (apiResponse.type === "document_generated") {
          botMessage.text = `${apiResponse.message} Title: ${apiResponse.document_title}`
        } else {
          botMessage.text = "Received an unexpected response format."
          botMessage.isError = true
        }

        setMessages((prev) => [...prev, botMessage])
        if (apiResponse.credits_used || (apiResponse.error && apiResponse.required)) {
          fetchProfileAndProjects() // Refresh credits
        }
      } catch (error) {
        cleanupLoadingProcess()
        console.error("Chat API Error:", error)
        const errorResponseMessage: Message = {
          id: `bot-error-${Date.now()}`,
          sender: "bot",
          timestamp: new Date(),
          text: `Error: ${(error as Error).message || "Failed to get response from 0Bullshit."}`,
          isError: true,
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
    },
    [
      inputValue,
      isLoading,
      currentProject,
      toast,
      setLastInvestorResults,
      setLastEmployeeResults,
      setLastDeepAnalysis,
      fetchProfileAndProjects,
      simulateLoadingProcess,
    ],
  )

  const renderBotMessageContent = (message: Message) => {
    if (message.isError) {
      return <p className="text-sm whitespace-pre-wrap text-red-600 dark:text-red-400">{message.text}</p>
    }
    if (message.investorResults) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Found {message.investorResults.length} investors:</p>
          {message.investorResults.slice(0, 3).map(
            (
              inv, // Show a few initially
            ) => (
              <div key={inv.id} className="p-2 border rounded-md bg-slate-50 dark:bg-slate-700">
                <p className="font-medium text-blue-600 dark:text-blue-400">{inv.name || inv.company_name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{inv.description.substring(0, 100)}...</p>
              </div>
            ),
          )}
          {message.investorResults.length > 3 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                /* TODO: Show all */
              }}
            >
              View all
            </Button>
          )}
          {message.deepAnalysis && <DeepAnalysisCard analysis={message.deepAnalysis} />}
        </div>
      )
    }
    if (message.employeeResults) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Found {message.employeeResults.length} employees:</p>
          {/* Render employee results similarly */}
        </div>
      )
    }
    // Check for upsell cards based on raw API response if needed
    // Example: if (message.rawApiResponse?.type === "upsell_growth") return <GrowthUpsellCard onUnlock={() => {}} />;

    return <p className="text-sm whitespace-pre-wrap">{message.text}</p>
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: Implement file upload logic for chat context
      toast({ title: "File selected: " + file.name, description: "File upload for chat context coming soon." })
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full bg-white dark:bg-slate-900">
      {messages.length === 0 && !isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Hello, {profile?.first_name || "User"}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">How can I help you today?</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestionChipsData.map((chip, index) => (
              <Button
                key={index}
                variant="outline"
                className="rounded-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600"
                onClick={() => handleSendMessage(chip.text)}
                disabled={isLoading}
              >
                <chip.icon className="mr-2 h-4 w-4" />
                {chip.text}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "flex items-end gap-2 max-w-[80%]",
                    msg.sender === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={
                        msg.sender === "user"
                          ? profile?.profile_picture_url || "/placeholder-user.jpg"
                          : "/placeholder-logo.svg"
                      }
                      alt={msg.sender}
                    />
                    <AvatarFallback>{msg.sender === "user" ? profile?.first_name?.[0] || "U" : "B"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div
                      className={cn(
                        "px-4 py-3 rounded-xl shadow-sm w-fit",
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none",
                        msg.isError && "bg-red-100 dark:bg-red-800 border border-red-500",
                      )}
                    >
                      {renderBotMessageContent(msg)}
                    </div>
                    <span
                      className={cn(
                        "text-xs text-slate-400 dark:text-slate-500 mt-1",
                        msg.sender === "user" ? "text-right" : "text-left",
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-end gap-2 max-w-[80%]">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/placeholder-logo.svg" alt="Bot" />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="px-4 py-3 rounded-xl shadow-sm w-fit bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none">
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                        <span className="text-sm">{loadingMessage || "Thinking..."}</span>
                      </div>
                      {progressValue > 0 && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-linear"
                            style={{ width: `${progressValue}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-left">Just now</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
      <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-end gap-2 bg-slate-50 dark:bg-slate-800">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 dark:text-slate-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        <TextareaAutosize
          className="flex-1 p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          minRows={1}
          maxRows={5}
        />
        <Button
          variant="default"
          size="icon"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-12 w-12 aspect-square"
          onClick={() => handleSendMessage()}
          disabled={isLoading || inputValue.trim() === ""}
          aria-label="Send message"
        >
          <SendHorizontal className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 dark:text-slate-400"
          onClick={() => toast({ title: "Voice input coming soon!" })}
          disabled={isLoading}
          aria-label="Use microphone"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
