import { supabase } from "../../../lib/supabase"
import type { AccessLevel, GymAccess, IdentityState } from "./identity.types"

function prioritize(current?: AccessLevel, incoming?: AccessLevel): AccessLevel {
  const rank: Record<AccessLevel, number> = { owner: 3, staff: 2, member: 1 }
  if (!current) return incoming ?? "member"
  if (!incoming) return current
  return rank[incoming] > rank[current] ? incoming : current
}

export async function loadIdentity(): Promise<IdentityState | null> {
  const { data: sessionRes, error: sessionErr } = await supabase.auth.getSession()
  if (sessionErr) throw sessionErr

  const session = sessionRes.session
  if (!session) return null

  const userId = session.user.id
  const email = session.user.email ?? undefined

  const [owned, staff, member] = await Promise.all([
    supabase.from("gyms").select("id").eq("owner_id", userId),
    supabase.from("gym_staff").select("gym_id").eq("user_id", userId).eq("status", "active"),
    supabase.from("memberships").select("gym_id").eq("user_id", userId).eq("status", "active"),
  ])

  if (owned.error) throw owned.error
  if (staff.error) throw staff.error
  if (member.error) throw member.error

  const map = new Map<string, AccessLevel>()

  for (const g of owned.data ?? []) map.set(g.id, "owner")
  for (const s of staff.data ?? []) map.set(s.gym_id, prioritize(map.get(s.gym_id), "staff"))
  for (const m of member.data ?? []) map.set(m.gym_id, prioritize(map.get(m.gym_id), "member"))

  const access: GymAccess[] = Array.from(map.entries()).map(([gymId, level]) => ({ gymId, level }))

  return { userId, email, access }
}