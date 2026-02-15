"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import Link from "next/link"

export function AuthOverlay() {
  const { user } = useAuth()

  // Don't show overlay if user is authenticated
  if (user) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Sign In Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Please sign in to access the AI Interviewer and start practicing your interview skills.
          </p>
          <Link href="/auth/signin" className="block">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
