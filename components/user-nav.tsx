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
import { Coins, LogOut, UserCircle, Settings, CreditCard } from "lucide-react" // Added icons
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function UserNav() {
  const { profile, credits, isLoadingProfile, fetchProfileAndProjects } = useApp() // Ensure credits is a number
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    // Reset app state by redirecting and letting AuthProvider handle it,
    // or by calling a reset function in AppContext if available.
    // For now, just clear token and push to login.
    // AppProvider's useEffect will clear profile/projects.
    router.push("/login")
    // Optionally, to be very explicit:
    // fetchProfileAndProjects(); // This will clear context if token is gone
  }

  return (
    <div className="flex items-center gap-4">
      {isLoadingProfile ? (
        <Skeleton className="h-8 w-24 rounded-md" />
      ) : (
        <Link
          href="/credits"
          className="flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Coins className="h-4 w-4 text-yellow-500" />
          <span>{credits.toLocaleString()}</span>
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              {isLoadingProfile ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <>
                  <AvatarImage src={profile?.profile_picture_url || "/placeholder-user.jpg"} alt={profile?.email} />
                  <AvatarFallback>{profile?.first_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              {isLoadingProfile ? (
                <>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full mt-1" />
                </>
              ) : (
                <>
                  <p className="text-sm font-medium leading-none truncate">
                    {profile ? `${profile.first_name} ${profile.last_name}` : "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {profile ? profile.email : "Loading..."}
                  </p>
                </>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center w-full">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/credits" className="flex items-center w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing & Credits</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 dark:text-red-400 focus:bg-red-100 dark:focus:bg-red-700/50 focus:text-red-700 dark:focus:text-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
