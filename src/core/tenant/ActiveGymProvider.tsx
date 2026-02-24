import React from "react"
import { useIdentity } from "../identity/IdentityProvider"
import { STORAGE_KEYS } from "../storage/keys"
import { getItem, removeItem, setItem } from "../storage/storage"

type ActiveGymCtx = {
  activeGymId: string | null
  setActiveGymId: (gymId: string | null) => Promise<void>
}

const ActiveGymContext = React.createContext<ActiveGymCtx | null>(null)

export function ActiveGymProvider({ children }: { children: React.ReactNode }) {
  const { identity, loading: identityLoading } = useIdentity()
  const [activeGymId, setActiveGymIdState] = React.useState<string | null>(null)

  const setActiveGymId = React.useCallback(async (gymId: string | null) => {
    setActiveGymIdState(gymId)
    if (!gymId) await removeItem(STORAGE_KEYS.activeGymId)
    else await setItem(STORAGE_KEYS.activeGymId, gymId)
  }, [])

  React.useEffect(() => {
    if (identityLoading) return

    if (!identity) {
      void setActiveGymId(null)
      return
    }

    ;(async () => {
      const saved = await getItem(STORAGE_KEYS.activeGymId)
      const allowed = new Set(identity.access.map((a) => a.gymId))

      if (saved && allowed.has(saved)) {
        setActiveGymIdState(saved)
        return
      }

      const first = identity.access[0]?.gymId ?? null
      await setActiveGymId(first)
    })()
  }, [identity, identityLoading, setActiveGymId])

  return (
    <ActiveGymContext.Provider value={{ activeGymId, setActiveGymId }}>
      {children}
    </ActiveGymContext.Provider>
  )
}

export function useActiveGym() {
  const ctx = React.useContext(ActiveGymContext)
  if (!ctx) throw new Error("useActiveGym must be used within ActiveGymProvider")
  return ctx
}