import type { AccessLevel } from "../identity/identity.types"
import { useIdentity } from "../identity/IdentityProvider"
import { useActiveGym } from "../tenant/ActiveGymProvider"
import type { Action } from "./actions"
import { can as canFn } from "./permissions"

export function useAccess() {
  const { identity, loading: identityLoading, refresh } = useIdentity()
  const { activeGymId, setActiveGymId } = useActiveGym()

  const accessList = identity?.access ?? []

  const activeLevel: AccessLevel | null =
    activeGymId ? accessList.find((a) => a.gymId === activeGymId)?.level ?? null : null

  const can = (action: Action, gymId?: string | null) =>
    canFn(action, { gymId: gymId ?? activeGymId, access: accessList })

  return {
    identity,
    identityLoading,
    refreshIdentity: refresh,
    activeGymId,
    setActiveGymId,
    activeLevel,
    can,
    gyms: accessList,
  }
}