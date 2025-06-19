"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/services/api"
import { Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"
import { useGoogleLogin } from "@react-oauth/google" // Added import

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await api.login({ email, password })
      console.log("Login API Response:", response) // Log the full response

      if (response.token) {
        localStorage.setItem("authToken", response.token)
        toast({ title: "Login Successful" })
        router.push("/")
        router.refresh() // Ensures layout re-renders with new auth state
      } else {
        // If no token, it's a failure. Use response.message or response.error.
        throw new Error(response.message || response.error || "Login failed: Unknown reason.")
      }
    } catch (error) {
      console.error("Login Error:", error) // Log the error object
      toast({
        title: "Login Failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Access Token received:", tokenResponse.access_token)
      setIsLoadingGoogle(true)
      try {
        // Send the access token to your backend
        const response = await api.googleLogin({ token: tokenResponse.access_token })
        console.log("Google Login API Response:", response)

        if (response.token) {
          localStorage.setItem("authToken", response.token)
          toast({ title: "Google Login Successful" })
          router.push("/")
          router.refresh()
        } else {
          throw new Error(response.message || response.error || "Google login failed: Unknown reason.")
        }
      } catch (error) {
        console.error("Google Login Error:", error)
        toast({
          title: "Google Login Failed",
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
        title: "Google Sign-In Failed",
        description: errorResponse.error_description || "Could not complete Google sign-in.",
        variant: "destructive",
      })
      setIsLoadingGoogle(false)
    },
    flow: "implicit", // Use 'implicit' for client-side flow to get access_token
  })

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl">Login to 0BullShit</CardTitle>
            <CardDescription>Enter your email below to login to your account.</CardDescription>
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
                Sign in with Google
              </Button>
            </div>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
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
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || isLoadingGoogle}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
