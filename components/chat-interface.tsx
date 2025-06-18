"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { SendHorizontal, Sparkles, Plus, Mic, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import CompactInvestorCard from "@/components/compact-investor-card"
import EmployeeFundCard from "@/components/employee-fund-card"
import DeepAnalysisCard from "@/components/deep-analysis-card"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { api, type ChatResponseType, type EmployeeResult, type InvestorResult } from "@/services/api"
import { Progress } from "@/components/ui/progress"
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

const loadingMessages = {
  investor_search: [
    "Analyzing 50,000+ investment funds...",
    "Applying ML compatibility algorithms...",
    "Calculating market timing scores...",
    "Generating strategic insights...",
  ],
  deep_investor_search: [
    "Initiating deep dive analysis...",
    "Analyzing 50,000+ investment funds & portfolio companies...",
    "Applying advanced ML compatibility algorithms...",
    "Cross-referencing thesis, past investments, and exit strategies...",
    "Calculating market timing and unique fit scores...",
    "Generating comprehensive insights and strategic recommendations...",
  ],
  employee_search: [
    "Scanning investment firm networks...",
    "Filtering high-quality contacts (score >44)...",
    "Mapping decision makers...",
    "Organizing by fund...",
  ],
}

const MAX_INITIAL_INVESTOR_CARDS = 5

export default function ChatInterface({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isDeepResearch, setIsDeepResearch] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userName = "Nikita"
  const { toast } = useToast()
  const {
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
  const [activeLoadingProcess, setActiveLoadingProcess] = useState<keyof typeof loadingMessages | null>(null)
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

  const simulateLoadingMessages = useCallback((type: keyof typeof loadingMessages) => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current)
    if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current)

    const currentProcessMessages = loadingMessages[type]
    let baseDuration = 5000
    if (type === "deep_investor_search") baseDuration = 10000
    else if (type === "employee_search") baseDuration = 6500
    const durationVariance = type === "deep_investor_search" ? Math.random() * 2000 - 1000 : Math.random() * 1000 - 500
    const duration = Math.max(3000, baseDuration + durationVariance)
    const messageIntervalTime = duration / currentProcessMessages.length
    let currentMessageIndex = 0

    setActiveLoadingProcess(type)
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

      const lowerCaseMessage = messageText.toLowerCase()
      let anticipatedProcess: keyof typeof loadingMessages | null = null
      if (lowerCaseMessage.includes("employee") || lowerCaseMessage.includes("empleado") || relatedInvestors)
        anticipatedProcess = "employee_search"
      else if (
        isDeepResearch ||
        lowerCaseMessage.includes("deep research") ||
        lowerCaseMessage.includes("análisis profundo")
      )
        anticipatedProcess = "deep_investor_search"
      else if (
        lowerCaseMessage.includes("investor") ||
        lowerCaseMessage.includes("fund") ||
        lowerCaseMessage.includes("vc") ||
        lowerCaseMessage.includes("inversor") ||
        lowerCaseMessage.includes("fondo")
      )
        anticipatedProcess = "investor_search"

      let clearLoadingProcessInterval: (() => void) | null = null
      if (anticipatedProcess) clearLoadingProcessInterval = simulateLoadingMessages(anticipatedProcess)

      try {
        const apiResponse = await api.chat({ message: messageText })
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
          rawApiResponse: apiResponse,
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
      inputValue,
      isLoading,
      isDeepResearch,
      toast,
      setLastInvestorResults,
      setLastEmployeeResults,
      setLastDeepAnalysis,
      simulateLoadingMessages,
    ],
  )

  const handleInvestorToggleFavorite = useCallback(
    async (investorId: string) => {
      setActionLoadingStates((prev) => ({ ...prev, [investorId]: true }))
      const investor =
        lastInvestorResults.find((inv) => inv.id === investorId) ||
        favoriteInvestors.find((inv) => inv.id === investorId)
      if (!investor) {
        toast({ title: "Error", description: "Investor not found.", variant: "destructive" })
        setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
        return
      }
      const currentIsFavorite = favoriteInvestors.some((fav) => fav.id === investorId)
      try {
        if (currentIsFavorite) {
          await api.updateInvestorSentiment(investorId, "dislike")
          removeFromFavorites(investorId, "investor")
          toast({ title: "Investor Unliked", description: `${investor.Company_Name} removed from favorites.` })
        } else {
          await api.updateInvestorSentiment(investorId, "like")
          addToFavorites(investor, "investor")
          toast({ title: "Investor Liked", description: `${investor.Company_Name} added to favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
      }
    },
    [addToFavorites, removeFromFavorites, toast, lastInvestorResults, favoriteInvestors],
  )

  const handleInvestorDislikeAction = useCallback(
    async (investorId: string) => {
      setActionLoadingStates((prev) => ({ ...prev, [investorId]: true }))
      const investor =
        lastInvestorResults.find((inv) => inv.id === investorId) ||
        favoriteInvestors.find((inv) => inv.id === investorId)
      if (!investor) {
        setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
        return
      }
      try {
        await api.updateInvestorSentiment(investorId, "dislike")
        removeFromFavorites(investorId, "investor")
        toast({ title: "Investor Disliked", description: `${investor.Company_Name} marked as disliked.` })
      } catch (error) {
        toast({ title: "Error", description: "Failed to update investor status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [investorId]: false }))
      }
    },
    [removeFromFavorites, toast, lastInvestorResults, favoriteInvestors],
  )

  const handleEmployeeToggleFavorite = useCallback(
    async (employee: EmployeeResult) => {
      setActionLoadingStates((prev) => ({ ...prev, [employee.id]: true }))
      const currentIsFavorite = favoriteEmployees.some((fav) => fav.id === employee.id)
      try {
        if (currentIsFavorite) {
          await api.updateEmployeeSentiment(employee.id, "dislike")
          removeFromFavorites(employee.id, "employee")
          toast({ title: "Employee Unliked", description: `${employee.fullName} removed from favorites.` })
        } else {
          await api.updateEmployeeSentiment(employee.id, "like")
          addToFavorites(employee, "employee")
          toast({ title: "Employee Liked", description: `${employee.fullName} added to favorites.` })
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to update employee status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
      }
    },
    [addToFavorites, removeFromFavorites, toast, favoriteEmployees],
  )

  const handleEmployeeDislikeAction = useCallback(
    async (employee: EmployeeResult) => {
      setActionLoadingStates((prev) => ({ ...prev, [employee.id]: true }))
      try {
        await api.updateEmployeeSentiment(employee.id, "dislike")
        removeFromFavorites(employee.id, "employee")
        toast({ title: "Employee Disliked", description: `${employee.fullName} marked as disliked.` })
      } catch (error) {
        toast({ title: "Error", description: "Failed to update employee status.", variant: "destructive" })
      } finally {
        setActionLoadingStates((prev) => ({ ...prev, [employee.id]: false }))
      }
    },
    [removeFromFavorites, toast],
  )

  const handleFindEmployeesForFunds = (investors: InvestorResult[]) => {
    if (!investors || investors.length === 0) {
      toast({ title: "No Investors", description: "No investors to find employees for.", variant: "default" })
      return
    }
    const fundNames = investors.map((inv) => inv.Company_Name).join(", ")
    const prompt = `Find employees for the following funds: ${fundNames}`
    handleSendMessage(prompt, investors)
  }

  const renderBotMessageContent = (message: Message) => {
    const response = message.rawApiResponse
    if (!response) return <p className="text-sm whitespace-pre-wrap">{message.text}</p>
    const messageId = message.id

    switch (response.type) {
      case "investor_results_normal":
      case "investor_results_deep":
        const investors = response.search_results.results
        const displayedInvestors = showAllInvestors[messageId]
          ? investors
          : investors.slice(0, MAX_INITIAL_INVESTOR_CARDS)
        return (
          <div className="space-y-3">
            {response.type === "investor_results_deep" && response.search_results.deep_analysis && (
              <DeepAnalysisCard analysis={response.search_results.deep_analysis} />
            )}
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Encontré {investors.length} inversores que podrían estar interesados:
            </p>
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {displayedInvestors.map((investor) => (
                <CompactInvestorCard
                  key={investor.id}
                  investor={investor}
                  onToggleFavorite={handleInvestorToggleFavorite}
                  onDislikeAction={handleInvestorDislikeAction}
                  isFavorite={favoriteInvestors.some((fav) => fav.id === investor.id)}
                  isLoading={actionLoadingStates[investor.id] || false}
                />
              ))}
            </div>
            {investors.length > MAX_INITIAL_INVESTOR_CARDS && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setShowAllInvestors((prev) => ({ ...prev, [messageId]: !prev[messageId] }))}
              >
                {showAllInvestors[messageId] ? "Show Less" : `Show All ${investors.length} Investors`}
              </Button>
            )}
            {message.investorResultsForEmployeeSearch && message.investorResultsForEmployeeSearch.length > 0 && (
              <Button
                variant="default"
                size="sm"
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleFindEmployeesForFunds(message.investorResultsForEmployeeSearch!)}
              >
                <Search className="mr-2 h-4 w-4" /> Find Employees for these funds
              </Button>
            )}
          </div>
        )
      case "employee_results":
        const employeesByFund = response.search_results.employees_by_fund
        const allEmployees = response.search_results.employees
        if (
          (!employeesByFund || Object.keys(employeesByFund).length === 0) &&
          (!allEmployees || allEmployees.length === 0)
        ) {
          return <p className="text-sm">No employees found for the specified criteria.</p>
        }
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">Resultados de empleados:</p>
            <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
              {employeesByFund && Object.keys(employeesByFund).length > 0
                ? Object.entries(employeesByFund).map(([fundName, fundEmployees]) => (
                    <EmployeeFundCard
                      key={fundName}
                      fundName={fundName}
                      employees={fundEmployees}
                      onToggleFavorite={handleEmployeeToggleFavorite}
                      onDislikeAction={handleEmployeeDislikeAction}
                      isEmployeeInFavorites={(empId) => favoriteEmployees.some((fav) => fav.id === empId)}
                      loadingStates={actionLoadingStates}
                    />
                  ))
                : allEmployees && allEmployees.length > 0
                  ? Object.entries(
                      allEmployees.reduce(
                        (acc, emp) => {
                          const company = emp.current_company_name || "Unknown Fund"
                          if (!acc[company]) acc[company] = []
                          acc[company].push(emp)
                          return acc
                        },
                        {} as Record<string, EmployeeResult[]>,
                      ),
                    ).map(([fundName, fundEmployees]) => (
                      <EmployeeFundCard
                        key={fundName}
                        fundName={fundName}
                        employees={fundEmployees}
                        onToggleFavorite={handleEmployeeToggleFavorite}
                        onDislikeAction={handleEmployeeDislikeAction}
                        isEmployeeInFavorites={(empId) => favoriteEmployees.some((fav) => fav.id === empId)}
                        loadingStates={actionLoadingStates}
                      />
                    ))
                  : null}
            </div>
          </div>
        )
      case "text_response":
        return <p className="text-sm whitespace-pre-wrap">{response.content}</p>
      case "error":
        return <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{response.content}</p>
      default:
        console.error("Unhandled response type:", response)
        return <p className="text-sm text-orange-500">Received an unhandled message type.</p>
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl md:text-5xl font-medium mb-4">
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
        <ScrollArea className="flex-1 p-4 sm:p-6 overflow-y-auto" ref={scrollAreaRef}>
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
                    "rounded-xl shadow-sm text-sm",
                    msg.sender === "user"
                      ? "p-3 bg-blue-600 text-white rounded-br-none"
                      : "p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700",
                    msg.sender === "bot" ? "w-full max-w-xl" : "max-w-[80%]",
                  )}
                >
                  {renderBotMessageContent(msg)}
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
            {isLoading && (
              <div className="flex items-start gap-3 justify-start w-full">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg?width=32&height=32" alt="0BullShit" />
                  <AvatarFallback>0B</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-xl shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700 w-full max-w-xl">
                  {activeLoadingProcess && loadingMessage ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{loadingMessage}</span>
                      </div>
                      <Progress value={progressValue} className="h-1.5" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
      <div className="px-4 sm:px-0 pb-3 pt-2 bg-white dark:bg-slate-900 border-t dark:border-slate-700">
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
