"use client"

import { useState } from "react"
import { MessageSquare, Star, Users, Briefcase, FileText, Send, Menu, Settings2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Chat", icon: MessageSquare, id: "chat" },
  { name: "Favourites/Unwanted", icon: Star, id: "favourites" },
  { name: "Investors", icon: Users, id: "investors" },
  { name: "Employees", icon: Briefcase, id: "employees" },
  { name: "Message Templates", icon: FileText, id: "templates" },
  { name: "Outreach", icon: Send, id: "outreach", prominent: true },
]

export default function NavigationSidebar() {
  const [activeItem, setActiveItem] = useState("chat")
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-[280px]",
      )}
    >
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h1 className="text-xl font-semibold text-slate-800">0BullShit</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">{isCollapsed ? "Expand menu" : "Collapse menu"}</span>
          </Button>
        </div>
        {!isCollapsed && <p className="text-xs text-slate-500 mt-1">2.5 Flash (preview)</p>}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeItem === item.id ? (item.prominent ? "default" : "secondary") : "ghost"}
            className={cn(
              "w-full justify-start h-10 text-sm",
              item.prominent && activeItem !== item.id && "text-blue-600 hover:bg-blue-50 hover:text-blue-700",
              item.prominent && activeItem === item.id && "bg-blue-600 hover:bg-blue-700 text-white",
              isCollapsed && "justify-center",
            )}
            onClick={() => setActiveItem(item.id)}
            title={item.name}
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && item.name}
          </Button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 hover:bg-slate-100">
            <Settings2 className="h-4 w-4 mr-3" />
            Settings & Help
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm text-slate-600 hover:bg-slate-100">
            <HelpCircle className="h-4 w-4 mr-3" />
            Activity
          </Button>
          <div className="text-xs text-slate-500 p-2">
            <p>Andorra</p>
            <p>
              From your IP address -{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Update location
              </a>
            </p>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="p-4 border-t border-slate-200 space-y-2 flex flex-col items-center">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100" title="Settings & Help">
            <Settings2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100" title="Activity">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      )}
    </aside>
  )
}
