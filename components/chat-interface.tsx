"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { SendHorizontal, Sparkles, Plus, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import InvestorsResultsTable from "@/components/investors-results-table"
import EmployeesResultsTable from "@/components/employees-results-table"
import DeepAnalysisCard from "@/components/deep-analysis-card"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
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
  { text: "Find investors for my fintech startup", icon: Sparkles },
  { text: "Search employees at Sequoia Capital", icon: Sparkles },
]

const loadingMessages = {
  deep: [
    "Analizando 50,000+ fondos de inversión...",
    "Aplicando algoritmos avanzados de matching...",
    "Calculando compatibility scores...",
    "Procesando datos de mercado en tiempo real...",
  ],
  normal: ["Buscando inversores relevantes...", "Analizando perfiles de inversión...", "Calculando compatibilidad..."],
  employees: [
    "Escaneando perfiles de LinkedIn...",
    "Identificando empleados clave...",
    "Analizando conexiones profesionales...",
    "Procesando datos de contacto...",
  ],
}

export default function ChatInterface({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isDeepResearch, setIsDeepResearch] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userName = "Nikita"
  const { toast } = useToast()
  const { setLastInvestorResults, setLastEmployeeResults, setLastDeepAnalysis } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector("div[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [messages])

  const simulateLoadingMessages = (type: "deep" | "normal" | "employees") => {
    const messages = loadingMessages[type]
    const duration = type === "deep" ? 10000 : type === "employees" ? 6500 : 5000
    const interval = duration / messages.length

    let currentIndex = 0
    setLoadingMessage(messages[0])

    const loadingInterval = setInterval(() => {
      currentIndex++
      if (currentIndex < messages.length) {
        setLoadingMessage(messages[currentIndex])
      } else {
        clearInterval(loadingInterval)
      }
    }, interval)

    return () => clearInterval(loadingInterval)
  }

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

    // Determine loading type based on message content
    let loadingType: "deep" | "normal" | "employees" = "normal"
    if (messageText.toLowerCase().includes("employee") || messageText.toLowerCase().includes("empleado")) {
      loadingType = "employees"
    } else if (
      isDeepResearch ||
      messageText.toLowerCase().includes("deep") ||
      messageText.toLowerCase().includes("análisis profundo")
    ) {
      loadingType = "deep"
    }

    const clearLoadingMessages = simulateLoadingMessages(loadingType)

    try {
      const apiResponse = await api.chat({
        message: messageText,
      })

      clearLoadingMessages()
      setLoadingMessage("")

      // Store results in global context for persistence AND auto-save
      if (apiResponse.type === "investor_results_normal") {
        setLastInvestorResults(apiResponse.search_results.results)
        setLastDeepAnalysis(null)

        // Auto-guardar inversores con manejo de errores mejorado y sin bloquear
        if (apiResponse.search_results.results.length > 0) {
          // No await - ejecutar en background
          Promise.allSettled(
            apiResponse.search_results.results.map(async (investor) => {
              const result = await api.saveInvestor(investor.id)
              return { success: !result.message.includes("Failed"), id: investor.id, result }
            }),
          )
            .then((results) => {
              const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length
              const failed = results.length - successful

              console.log(`Auto-save investors: ${successful} successful, ${failed} failed`)

              // Solo mostrar toast si hay éxitos
              if (successful > 0) {
                toast({
                  title: "Investors Auto-saved",
                  description: `${successful} investors saved for template generation${failed > 0 ? ` (${failed} failed)` : ""}`,
                })
              }
            })
            .catch((error) => {
              console.error("Auto-save investors error:", error)
            })
        }
      } else if (apiResponse.type === "investor_results_deep") {
        setLastInvestorResults(apiResponse.search_results.results)
        setLastDeepAnalysis(apiResponse.search_results.deep_analysis)

        // Auto-guardar inversores con manejo de errores mejorado y sin bloquear
        if (apiResponse.search_results.results.length > 0) {
          // No await - ejecutar en background
          Promise.allSettled(
            apiResponse.search_results.results.map(async (investor) => {
              const result = await api.saveInvestor(investor.id)
              return { success: !result.message.includes("Failed"), id: investor.id, result }
            }),
          )
            .then((results) => {
              const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length
              const failed = results.length - successful

              console.log(`Auto-save deep investors: ${successful} successful, ${failed} failed`)

              if (successful > 0) {
                toast({
                  title: "Investors Auto-saved",
                  description: `${successful} investors saved for template generation${failed > 0 ? ` (${failed} failed)` : ""}`,
                })
              }
            })
            .catch((error) => {
              console.error("Auto-save deep investors error:", error)
            })
        }
      } else if (apiResponse.type === "employee_results") {
        setLastEmployeeResults(apiResponse.search_results.employees)

        // Auto-guardar empleados con manejo de errores mejorado y sin bloquear
        if (apiResponse.search_results.employees.length > 0) {
          // No await - ejecutar en background
          Promise.allSettled(
            apiResponse.search_results.employees.map(async (employee) => {
              const result = await api.saveEmployee(employee.id)
              return { success: !result.message.includes("Failed"), id: employee.id, result }
            }),
          )
            .then((results) => {
              const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length
              const failed = results.length - successful

              console.log(`Auto-save employees: ${successful} successful, ${failed} failed`)

              if (successful > 0) {
                toast({
                  title: "Employees Auto-saved",
                  description: `${successful} employees saved for template generation${failed > 0 ? ` (${failed} failed)` : ""}`,
                })
              }
            })
            .catch((error) => {
              console.error("Auto-save employees error:", error)
            })
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        timestamp: new Date(),
        rawApiResponse: apiResponse,
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      clearLoadingMessages()
      setLoadingMessage("")

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
      case "investor_results_normal":
        return (
          <div className="space-y-4">
            <p className="text-sm">
              Encontré {response.search_results.results.length} inversores que podrían estar interesados en tu proyecto:
            </p>
            <InvestorsResultsTable
              investors={response.search_results.results}
              projectId={projectId}
              showLimit={true}
              maxResults={5}
            />
          </div>
        )

      case "investor_results_deep":
        return (
          <div className="space-y-4">
            <p className="text-sm">
              Análisis profundo completado. Encontré {response.search_results.results.length} inversores con análisis
              detallado:
            </p>
            <DeepAnalysisCard analysis={response.search_results.deep_analysis} />
            <InvestorsResultsTable
              investors={response.search_results.results}
              projectId={projectId}
              showLimit={true}
              maxResults={5}
            />
          </div>
        )

      case "employee_results":
        return (
          <div className="space-y-4">
            <p className="text-sm">Encontré {response.search_results.employees.length} empleados relevantes:</p>
            <EmployeesResultsTable
              employees={response.search_results.employees}
              projectId={projectId}
              showLimit={true}
              maxResults={5}
            />
            {response.search_results.employees_by_fund &&
              Object.keys(response.search_results.employees_by_fund).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Empleados agrupados por fondo:</h4>
                  {Object.entries(response.search_results.employees_by_fund).map(([fund, employees]) => (
                    <div key={fund} className="mb-4">
                      <h5 className="font-medium text-sm mb-2">
                        {fund} ({employees.length} empleados)
                      </h5>
                      <EmployeesResultsTable
                        employees={employees}
                        projectId={projectId}
                        showLimit={true}
                        maxResults={3}
                      />
                    </div>
                  ))}
                </div>
              )}
          </div>
        )

      case "text_response":
        return <p className="text-sm whitespace-pre-wrap">{response.content}</p>

      case "error":
        return <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">{response.content}</p>

      default:
        console.error("Unhandled response type:", response)
        return (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Received an unhandled message type: {(response as any).type}
          </p>
        )
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
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
                    msg.sender === "bot" &&
                      msg.rawApiResponse &&
                      (msg.rawApiResponse.type === "investor_results_normal" ||
                        msg.rawApiResponse.type === "investor_results_deep" ||
                        msg.rawApiResponse.type === "employee_results")
                      ? "w-full max-w-none"
                      : "",
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
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                  <AvatarImage src="/placeholder.svg?width=32&height=32" alt="0BullShit" />
                  <AvatarFallback>0B</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-xl shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
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
                    {loadingMessage && (
                      <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">{loadingMessage}</span>
                    )}
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
