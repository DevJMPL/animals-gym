import React from "react"
import { supabase } from "../../../lib/supabase"
import { loadIdentity } from "./identity.api"
import type { IdentityState } from "./identity.types"

type IdentityCtx = {
  identity: IdentityState | null
  loading: boolean
  refresh: () => Promise<void>
}

const IdentityContext = React.createContext<IdentityCtx | null>(null)

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = React.useState<IdentityState | null>(null)
  const [loading, setLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    try {
      const id = await loadIdentity()
      setIdentity(id)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refresh()

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setIdentity(null)
        setLoading(false)
      } else {
        void refresh()
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [refresh])

  return (
    <IdentityContext.Provider value={{ identity, loading, refresh }}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity() {
  const ctx = React.useContext(IdentityContext)
  if (!ctx) throw new Error("useIdentity must be used within IdentityProvider")
  return ctx
}