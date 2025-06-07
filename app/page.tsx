import ChatInterface from "@/components/chat-interface"

export default function HomePage() {
  return (
    <div className="flex h-screen w-full">
      <main className="flex-1 bg-white overflow-hidden">
        <ChatInterface projectId="p1" />
      </main>
    </div>
  )
}
