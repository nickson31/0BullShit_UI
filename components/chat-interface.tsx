"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { SendHorizontal, Sparkles, Mic, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type ChatResponseType, type InvestorResult } from "@/services/api"
import TextareaAutosize from "react-textarea-autosize"
import cn from "classnames"
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
    profile, // Usar profile para el nombre del usuario
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
    async (text?: string) => {
      // Removed relatedInvestors as it's not used
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
      if (!text) setInputValue("") // Clear input only if it's not a suggestion chip

      setIsLoading(true)
      setLoadingMessage("")
      setProgressValue(0)
      setActiveLoadingProcess(null)

      let clearLoadingProcessInterval: (() => void) | null = null

      try {
        const apiResponse = await api.chat({ message: messageText, project_id: currentProject.id })

        const botName = apiResponse.bot || "AI Assistant" // Assuming bot name might be in apiResponse.bot
        if (botName) {
          clearLoadingProcessInterval = simulateLoadingMessages(botName)
        }

        const responseContent = apiResponse.response || "No response from bot."

        // Update state based on response type
        if (apiResponse.type === "investor_results_normal") {
          setLastInvestorResults(apiResponse.search_results.results)
          setLastDeepAnalysis(null)
        } else if (apiResponse.type === "investor_results_deep") {
          setLastInvestorResults(apiResponse.search_results.results)
          setLastDeepAnalysis(apiResponse.search_results.deep_analysis)
        } else if (apiResponse.type === "employee_results") {
          setLastEmployeeResults(apiResponse.search_results.employees)
        }
        // For text_response, document_generated, or error, the content is directly in apiResponse.content or apiResponse.error
        const botMessageText =
          apiResponse.type === "text_response"
            ? apiResponse.content
            : apiResponse.type === "document_generated"
              ? apiResponse.message
              : apiResponse.type === "error"
                ? apiResponse.content
                : "Unknown response type or content."

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          timestamp: new Date(),
          text: botMessageText, // Use the parsed bot message text
          rawApiResponse: apiResponse, // Keep raw response for detailed rendering if needed
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
    // Now that message.text is already processed, we can just render it.
    // If you need to render specific UI for investor/employee results,
    // you would do it here based on message.rawApiResponse.type
    return <p className="text-sm whitespace-pre-wrap">{message.text}</p>
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Hello, {profile?.first_name || "User"} {/* Usar profile.first_name */}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg">How can I help you today?</p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestionChipsData.map((chip, index) => (
              <Button
                key={index}
                variant="outline"
                className="rounded-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
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
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex mb-4", msg.sender === "user" ? "justify-end" : "justify-start")}>
              <div className="flex items-end" style={{ flexDirection: msg.sender === "user" ? "row-reverse" : "row" }}>
                {msg.sender === "bot" && (
                  <Avatar className="h-8 w-8 flex-shrink-0 mr-2">
                    <AvatarImage src="/placeholder.svg?width=32&height=32" alt="Bot" />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col space-y-1 max-w-md">
                  <div
                    className={cn(
                      "text-xs text-slate-400 dark:text-slate-500",
                      msg.sender === "user" ? "text-right" : "text-left",
                    )}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-lg w-fit",
                      msg.sender === "user"
                        ? "bg-blue-100 dark:bg-blue-800 ml-auto"
                        : "bg-slate-100 dark:bg-slate-800 mr-auto",
                    )}
                  >
                    {renderBotMessageContent(msg)}
                  </div>
                </div>
                {msg.sender === "user" && (
                  <Avatar className="h-8 w-8 flex-shrink-0 ml-2">
                    <AvatarImage src="/placeholder.svg?width=32&height=32" alt={profile?.first_name} />
                    <AvatarFallback>{profile?.first_name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-end">
                <Avatar className="h-8 w-8 flex-shrink-0 mr-2">
                  <AvatarImage src="/placeholder.svg?width=32&height=32" alt="Bot" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 max-w-md">
                  <div className="text-xs text-slate-400 dark:text-slate-500">{new Date().toLocaleTimeString()}</div>
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">{loadingMessage}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700 mt-2">
                      <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${progressValue}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      )}
      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex space-x-2">
        <TextareaAutosize
          className="flex-1 min-h-[60px] px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border-none resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown} // Add keydown handler
          disabled={isLoading}
        />
        <Button
          variant="default"
          size="icon"
          onClick={() => handleSendMessage()}
          disabled={isLoading || inputValue.trim() === ""}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
        <Button
          variant="default"
          size="icon"
          onClick={() => toast({ title: "Feature coming soon!" })}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
