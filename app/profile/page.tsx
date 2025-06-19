"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/contexts/AppContext"
import { Loader2, Camera, KeyRound, Trash2, BarChart3, ShieldCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/services/api" // For direct API calls if needed

export default function ProfilePage() {
  const { profile, isLoadingProfile, fetchProfileAndProjects } = useApp()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("") // Email is generally not editable by user
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPicture, setIsUploadingPicture] = useState(false)

  // Mock usage statistics
  const usageStats = {
    searchesThisMonth: 120,
    documentsGenerated: 15,
    activeProjects: profile?.id ? 3 : 0, // Example
  }

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setEmail(profile.email || "")
      setProfilePictureUrl(profile.profile_picture_url || null)
    }
  }, [profile])

  const handleSaveProfile = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      // Backend doesn't have a PUT /user/profile, so this is simulated
      const updatedProfileData = await api.updateProfile(profile.id, {
        first_name: firstName,
        last_name: lastName,
        // email cannot be changed here
        profile_picture_url: profilePictureUrl || undefined,
      })
      await fetchProfileAndProjects() // Re-fetch to update context
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      })
      setIsEditing(false)
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
      setFirstName(profile.first_name || "")
      setLastName(profile.last_name || "")
      setProfilePictureUrl(profile.profile_picture_url || null)
    }
    setIsEditing(false)
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && profile) {
      setIsUploadingPicture(true)
      try {
        const response = await api.uploadProfilePicture(file) // Simulated
        setProfilePictureUrl(response.profile_picture_url)
        // Immediately try to save this change or include it in the main save
        // For simplicity, let's assume it's part of the main save
        toast({ title: "Profile picture updated", description: "Save changes to apply." })
      } catch (error) {
        toast({ title: "Picture Upload Failed", description: (error as Error).message, variant: "destructive" })
      } finally {
        setIsUploadingPicture(false)
      }
    }
  }

  const handleChangePassword = () => {
    // Backend doesn't have this endpoint
    toast({
      title: "Change Password",
      description: "Password change functionality is not yet available. Please contact support if needed.",
      duration: 5000,
    })
  }

  const handleDeleteAccount = () => {
    // Backend doesn't have this endpoint
    toast({
      title: "Delete Account",
      description: "Account deletion is a permanent action. This feature is not yet available. Please contact support.",
      variant: "destructive",
      duration: 5000,
    })
  }

  if (isLoadingProfile && !profile) {
    // Show full page skeleton if profile is initially loading
    return (
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Card>
          <CardHeader className="items-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>
        {!isLoadingProfile && (
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} size="sm">
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-700 shadow-lg">
                  <AvatarImage src={profilePictureUrl || "/placeholder-user.jpg"} alt={profile?.email} />
                  <AvatarFallback className="text-5xl bg-slate-200 dark:bg-slate-700">
                    {profile?.first_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-1 right-1 rounded-full h-10 w-10 shadow-md"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPicture || isSaving}
                    aria-label="Change profile picture"
                  >
                    {isUploadingPicture ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                  </Button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <CardTitle className="text-2xl">{`${firstName || "User"} ${lastName || ""}`.trim()}</CardTitle>
              <CardDescription>{email || "No email"}</CardDescription>
            </CardHeader>
            {profile && (
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Subscription Plan:
                  <span className="font-semibold text-blue-600 dark:text-blue-400 ml-1 capitalize">
                    {profile.subscription_plan}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Credits:
                  <span className="font-semibold text-green-600 dark:text-green-400 ml-1">
                    {profile.credits.toLocaleString()}
                  </span>
                </p>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
                Usage Statistics
              </CardTitle>
              <CardDescription>Your activity on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Searches this month:</span> <span className="font-semibold">{usageStats.searchesThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span>Documents generated:</span> <span className="font-semibold">{usageStats.documentsGenerated}</span>
              </div>
              <div className="flex justify-between">
                <span>Active projects:</span> <span className="font-semibold">{usageStats.activeProjects}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    placeholder="Your first name"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing || isSaving}
                    placeholder="Your last name"
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled={true}
                  placeholder="your@email.com"
                  aria-describedby="email-description"
                />
                <p id="email-description" className="text-xs text-muted-foreground">
                  Email cannot be changed after registration.
                </p>
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={
                    isSaving ||
                    (profile?.first_name === firstName &&
                      profile?.last_name === lastName &&
                      profile?.profile_picture_url === profilePictureUrl)
                  }
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-green-500" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={handleChangePassword} className="w-full sm:w-auto justify-start">
                <KeyRound className="mr-2 h-4 w-4" /> Change Password
              </Button>
              <p className="text-xs text-muted-foreground">
                Regularly updating your password helps keep your account secure.
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-500/50 dark:border-red-500/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-5 w-5" />
                Account Management
              </CardTitle>
              <CardDescription>Manage your account deletion preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount} className="w-full sm:w-auto justify-start">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This action is irreversible and will permanently delete all your data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
