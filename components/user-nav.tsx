"use client"

import { useApp } from "@/contexts/AppContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Coins, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserNav() {
  const { profile, credits, isLoadingProfile } = useApp()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      {isLoadingProfile ? (
        <Skeleton className="h-8 w-24 rounded-md" />
      ) : (
        <div className="flex items-center gap-2 rounded-full border bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span>{credits?.toLocaleString() ?? 0}</span>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {isLoadingProfile ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <>
                  <AvatarImage src="/placeholder.svg?width=32&height=32" alt={profile?.email} />
                  <AvatarFallback>{profile?.first_name?.[0]?.toUpperCase()}</AvatarFallback>
                </>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile ? `${profile.first_name} ${profile.last_name}` : <Skeleton className="h-4 w-24" />}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {profile ? profile.email : <Skeleton className="h-3 w-32 mt-1" />}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
