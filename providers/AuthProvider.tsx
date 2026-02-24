import type { Session } from "@supabase/supabase-js"
import React from "react"
import { supabase } from "../lib/supabase"

type AuthCtx = {
  session: Session | null
  isLoading: boolean
}

const AuthContext = React.createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    ;(async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) setSession(null)
      else setSession(data.session ?? null)
      setIsLoading(false)
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}