"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  Users,
  Star,
  Send,
  FileText,
  UserCircle2
} from "lucide-react"

const routes = [
  {
    label: "Chat",
    icon: MessageSquare,
    href: "/",
    color: "text-violet-500",
  },
  {
    label: "Investors",
    icon: Users,
    href: "/investors",
    color: "text-pink-700",
  },
  {
    label: "Employees",
    icon: UserCircle2,
    href: "/employees",
    color: "text-orange-700",
  },
  {
    label: "Favourites",
    icon: Star,
    href: "/favourites",
    color: "text-yellow-500",
  },
  {
    label: "Templates",
    icon: FileText,
    href: "/templates",
    color: "text-green-700",
  },
  {
    label: "Outreach",
    icon: Send,
    href: "/outreach",
    color: "text-blue-700",
  }
]

export function NavigationSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-900 text-white">
      <div className="px-3 py-2 flex-1">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
