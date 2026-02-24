import type { AccessLevel, GymAccess } from "../identity/identity.types"
import type { Action } from "./actions"

type Ctx = {
  gymId?: string | null
  access: GymAccess[]
}

function levelForGym(access: GymAccess[], gymId: string): AccessLevel | null {
  return access.find((a) => a.gymId === gymId)?.level ?? null
}

export function can(action: Action, ctx: Ctx): boolean {
  if (action === "gym.create") return true
  if (action === "membership.join") return true

  const gymId = ctx.gymId
  if (!gymId) return false

  const level = levelForGym(ctx.access, gymId)
  if (!level) return false

  switch (action) {
    case "gym.publish":
      return level === "owner"
    case "gym.edit":
    case "gym.hours.edit":
      return level === "owner" || level === "staff"
    case "staff.invite":
    case "staff.manage":
      return level === "owner"
    case "membership.manage":
      return level === "owner" || level === "staff"
    default:
      return false
  }
}