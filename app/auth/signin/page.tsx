"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"

export default function SigninPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [user, loading, router])

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Sign in to save your sessions and access the interview tools.</p>

          <Button
            className="w-full"
            onClick={() => signInWithGoogle('/')}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
