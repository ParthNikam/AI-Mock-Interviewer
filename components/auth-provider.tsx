"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextValue = {
  supabase: ReturnType<typeof createBrowserClient>
  session: Session | null
  user: User | null
  loading: boolean
  signInWithGoogle: (redirectTo?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session: initialSession } } = await supabase.auth.getSession()

      if (!mounted) return
      setSession(initialSession ?? null)
      setUser(initialSession?.user ?? null)
      setLoading(false)
    }

  init()

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session ?? null)
    setUser(session?.user ?? null)
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
  }, [supabase])

  const signInWithGoogle = async (redirectTo = "/") => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://ftcccpdlbefahxxizoej.supabase.co/auth/v1/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }

  const value = {
    supabase,
    session,
    user,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
