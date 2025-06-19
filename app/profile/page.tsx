"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { Loader2, Camera, KeyRound, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const { profile, isLoadingProfile, fetchProfileAndProjects } = useApp()
  const { toast } = useToast()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name)
      setLastName(profile.last_name)
      setEmail(profile.email)
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement actual API call to update profile (PUT /user/profile)
      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      })
      setIsEditing(false)
      // Re-fetch profile to ensure data consistency if backend was updated
      await fetchProfileAndProjects()
    } catch (error) {
      toast({
        title: "Failed to Update Profile",
        description: (error as Error).message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setFirstName(profile.first_name)
      setLastName(profile.last_name)
      setEmail(profile.email)
    }
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Password change functionality is under development.",
    })
  }

  const handleDeleteAccount = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Account deletion functionality is under development.",
    })
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        {!isLoadingProfile && (
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        )}
      </div>

      {isLoadingProfile ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-user.jpg" alt={profile?.email} />
                  <AvatarFallback className="text-4xl">{profile?.first_name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() =>
                      toast({
                        title: "Feature Coming Soon",
                        description: "Profile picture upload is under development.",
                      })
                    }
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <CardTitle className="text-xl">{`${profile?.first_name} ${profile?.last_name}`}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing || isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing || isSaving}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={true} // Email is usually not editable directly
                />
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button variant="outline" onClick={handleChangePassword} className="justify-start">
                <KeyRound className="mr-2 h-4 w-4" /> Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Permanently delete your account.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button variant="destructive" onClick={handleDeleteAccount} className="justify-start">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
