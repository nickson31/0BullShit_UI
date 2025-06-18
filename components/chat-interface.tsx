"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { SendHorizontal, Sparkles, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type ChatResponseType, type InvestorResult } from "@/services/api"
import TextareaAutosize from "react-textarea-autosize"
// useRouter is not needed here as cards handle their own navigation for templates

interface Message {
  id: string
  text?: string | React.ReactNode
  sender: "user" | "bot"
  timestamp: Date
  rawApiResponse?: ChatResponseType
  investorResultsForEmployeeSearch?: InvestorResult[]
}

const initialMessages: Message[] = []

const suggestionChipsData = [
  { text: "Find investors for my fintech startup", icon: Sparkles },
  { text: "Search employees at Sequoia Capital", icon: Sparkles },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const {
    profile,
    currentProject,
    setLastInvestorResults,
    setLastEmployeeResults,
    setLastDeepAnalysis,
    favoriteInvestors,
    favoriteEmployees,
    addToFavorites,
    removeFromFavorites,
    lastInvestorResults,
  } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [actionLoadingStates, setActionLoadingStates] = useState<Record<string, boolean>>({})
  const [activeLoadingProcess, setActiveLoadingProcess] = useState<string | null>(null)
  const [progressValue, setProgressValue] = useState(0)
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressAnimationRef = useRef<number | null>(null)
  const progressStartTimeRef = useRef<number | null>(null)
  const [showAllInvestors, setShowAllInvestors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  const simulateLoadingMessages = useCallback((botName: string) => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)

    // Simplified loading messages
    const currentProcessMessages = [`Engaging ${botName}...`, "Analyzing context...", "Generating response..."]
    const duration = 5000
    const messageIntervalTime = duration / currentProcessMessages.length
    let currentMessageIndex = 0

    setActiveLoadingProcess(botName)
    setLoadingMessage(currentProcessMessages[0])
    setProgressValue(0)
    progressStartTimeRef.current = performance.now()

    const animateProgress = (timestamp: number) => {
      if (!progressStartTimeRef.current) progressStartTimeRef.current = timestamp
      const elapsed = timestamp - progressStartTimeRef.current
      const calculatedProgress = Math.min((elapsed / duration) * 100, 100)
      setProgressValue(calculatedProgress)
      if (elapsed < duration) progressAnimationRef.current = requestAnimationFrame(animateProgress)
      else setProgressValue(100)
    }
    progressAnimationRef.current = requestAnimationFrame(animateProgress)

    loadingIntervalRef.current = setInterval(() => {
      currentMessageIndex++
      if (currentMessageIndex < currentProcessMessages.length)
        setLoadingMessage(currentProcessMessages[currentMessageIndex])
      else if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    }, messageIntervalTime)

    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
        loadingIntervalRef.current = null
      }
      if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current)
        progressAnimationRef.current = null
      }
      progressStartTimeRef.current = null
    }
  }, [])

  const handleSendMessage = useCallback(
    async (text?: string, relatedInvestors?: InvestorResult[]) => {
      const messageText = text || inputValue
      if (messageText.trim() === "" || isLoading) return

      if (!currentProject) {
        toast({
          title: "No Project Selected",
          description: "Please select a project before starting a chat.",
          variant: "destructive",
        })
        return
      }

      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, newUserMessage])
      if (!text) setInputValue("")

      setIsLoading(true)
      setLoadingMessage("")
      setProgressValue(0)
      setActiveLoadingProcess(null)

      let clearLoadingProcessInterval: (() => void) | null = null

      try {
        const apiResponse = await api.chat({ message: messageText, project_id: currentProject.id })

        // The new backend response doesn't seem to follow the old ChatResponseType exactly.
        // It has a `bot` and `response` field. We will adapt to this.
        // Let's assume the response text is in `response.response` and bot name in `response.bot`
        const botName = apiResponse.bot || "AI Assistant"
        if (botName) {
          clearLoadingProcessInterval = simulateLoadingMessages(botName)
        }

        // Here we need to parse apiResponse.response to see if it contains structured data
        // This is a simplification. A real implementation would have a more robust parsing logic.
        const responseContent = apiResponse.response || "No response from bot."

        if (apiResponse.type === "investor_results_normal") {
          setLastInvestorResults(apiResponse.search_results.results)
          setLastDeepAnalysis(null)
        } else if (apiResponse.type === "investor_results_deep") {
          setLastInvestorResults(apiResponse.search_results.results)
          setLastDeepAnalysis(apiResponse.search_results.deep_analysis)
        } else if (apiResponse.type === "employee_results") {
          setLastEmployeeResults(apiResponse.search_results.employees)
        }
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: new Date(),
          text: responseContent,
          investorResultsForEmployeeSearch:
            apiResponse.type === "investor_results_normal" || apiResponse.type === "investor_results_deep"
              ? apiResponse.search_results.results
              : undefined,
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
        if (clearLoadingProcessInterval) clearLoadingProcessInterval()
        setActiveLoadingProcess(null)
        setLoadingMessage("")
        setProgressValue(0)
        setIsLoading(false)
      }
    },
    [
      currentProject,
      inputValue,
      isLoading,
      toast,
      setLastInvestorResults,
      setLastEmployeeResults,
      setLastDeepAnalysis,
      simulateLoadingMessages,
    ],
  )

  const renderBotMessageContent = (message: Message) => {
    const response = message.rawApiResponse
    if (!response) return <p className="text-sm">No response from bot.</p>

    switch (response.type) {
      case "investor_results_normal":
      case "investor_results_deep":
        return <p className="text-sm">Investor results would be displayed here.</p>
      case "employee_results":
        return <p className="text-sm">Employee results would be displayed here.</p>
      case "text_response":
        return <p className="text-sm whitespace-pre-wrap">{response.content}</p>
      case "error":
        return <p className="text-sm text-red-500">{response.error}</p>
      default:
        return <p className="text-sm">Unknown response type.</p>
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Hello, {profile?.first_name || "User"}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">How can I help you today?</p>
        </div>
      ) : (
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-end justify-end mb-4">
              <div className="flex flex-col space-y-2 max-w-md mx-6">
                {msg.sender === "bot" && (
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg?width=32&height=32" alt="Bot" />
                      <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                        {renderBotMessageContent(msg)}
                      </div>
                    </div>
                  </div>
                )}
                {msg.sender === "user" && (
                  <div className="flex items-center">
                    <div className="flex flex-col space-y-1">
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="p-4 bg-blue-100 dark:bg-blue-800 rounded-lg w-fit">{msg.text}</div>
                    </div>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg?width=32&height=32" alt={profile?.first_name} />
                      <AvatarFallback>{profile?.first_name?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex space-x-2">
        <TextareaAutosize
          className="flex-1 min-h-[60px] px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border-none resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button variant="default" size="icon" onClick={() => handleSendMessage()}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="default" size="icon" onClick={() => console.log("Feature coming soon!")}>
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
