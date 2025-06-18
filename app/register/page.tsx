"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { api } from "@/services/api" // Import the api service
import { useGoogleLogin } from "@react-oauth/google" // Added import

// Define password validation criteria (mirroring backend if possible)
const passwordRequirements = [
  { regex: /.{8,}/, message: "At least 8 characters" },
  { regex: /[A-Z]/, message: "At least one uppercase letter" },
  { regex: /[a-z]/, message: "At least one lowercase letter" },
  { regex: /\d/, message: "At least one number" },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "At least one special character" },
]

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState(
    passwordRequirements.map((r) => ({ ...r, valid: false })),
  )

  const router = useRouter()
  const { toast } = useToast()

  const validatePassword = (currentPassword: string) => {
    setPasswordValidation(passwordRequirements.map((r) => ({ ...r, valid: r.regex.test(currentPassword) })))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    validatePassword(newPassword)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    const isPasswordValid = passwordValidation.every((r) => r.valid)
    if (!isPasswordValid) {
      toast({ title: "Password does not meet requirements", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await api.register({
        email,
        password,
        first_name: firstName, // Match backend field name
        last_name: lastName, // Match backend field name
      })

      if (response.token) {
        // If backend logs in user directly after registration
        localStorage.setItem("authToken", response.token)
        toast({ title: "Registration Successful", description: "Welcome to 0BullShit!" })
        router.push("/")
        router.refresh()
      } else if (response.user_id) {
        // If backend just registers and doesn't log in directly
        toast({ title: "Registration Successful", description: "Please log in with your new account." })
        router.push("/login")
      } else {
        throw new Error(response.error || "Registration failed")
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoadingGoogle(true)
      try {
        // Send the access token to your backend. Your backend should handle
        // whether this is a new user registration or an existing user login.
        const response = await api.googleLogin({ token: tokenResponse.access_token })
        console.log("Google Sign-up/Login API Response:", response)

        if (response.token) {
          localStorage.setItem("authToken", response.token)
          toast({ title: "Google Sign-up/Login Successful", description: "Welcome to 0BullShit!" })
          router.push("/")
          router.refresh()
        } else {
          throw new Error(response.message || response.error || "Google sign-up/login failed: Unknown reason.")
        }
      } catch (error) {
        console.error("Google Sign-up/Login Error:", error)
        toast({
          title: "Google Sign-up/Login Failed",
          description: (error as Error).message,
          variant: "destructive",
        })
      } finally {
        setIsLoadingGoogle(false)
      }
    },
    onError: (errorResponse) => {
      console.error("Google OAuth Error:", errorResponse)
      toast({
        title: "Google Sign-Up Failed",
        description: errorResponse.error_description || "Could not complete Google sign-up.",
        variant: "destructive",
      })
      setIsLoadingGoogle(false)
    },
    flow: "implicit", // Use 'implicit' for client-side flow to get access_token
  })

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <Card className="w-full max-w-md">
        <form onSubmit={handleRegister}>
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Enter your details to get started with 0BullShit.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => googleLogin()}
                disabled={isLoading || isLoadingGoogle}
              >
                {isLoadingGoogle ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FcGoogle className="mr-2 h-4 w-4" />
                )}
                Sign up with Google
              </Button>
            </div>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <ul className="text-xs mt-1 space-y-0.5">
                {passwordValidation.map((req, index) => (
                  <li key={index} className={req.valid ? "text-green-600" : "text-slate-500"}>
                    {req.valid ? "✓" : "•"} {req.message}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingGoogle}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
