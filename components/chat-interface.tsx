"use client"

import { useState } from "react"
import { Send, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatResponse {
  type: string;
  content: string;
}

export default function ChatInterface({ projectId }: { projectId: string }) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message immediately
    setMessages(prev => [...prev, {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          message: userMessage
        })
      })

      if (!response.ok) throw new Error("Failed to send message")
      
      const data = await response.json() as ChatResponse
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn("flex", 
              message.role === "assistant" ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn("max-w-[80%] rounded-lg p-4",
                message.role === "assistant"
                  ? "bg-gray-100 dark:bg-gray-800"
                  : "bg-blue-600 text-white"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 dark:bg-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-10"
              disabled={isLoading}
            />
            <Button
              type="button"
              className="absolute right-0 top-0 h-full px-3"
              variant="ghost"
              size="icon"
              disabled={isLoading}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
