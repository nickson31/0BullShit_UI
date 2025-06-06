import ProjectSelectorSidebar from "@/components/project-selector-sidebar"
import NavigationSidebar from "@/components/navigation-sidebar"
import ChatInterface from "@/components/chat-interface"

export default function HomePage() {
  return (
    <div className="flex h-screen w-full">
      <ProjectSelectorSidebar />
      <NavigationSidebar />
      <main className="flex-1 bg-white overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  )
}
