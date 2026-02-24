export type AccessLevel = "owner" | "staff" | "member"

export type GymAccess = {
  gymId: string
  level: AccessLevel
}

export type IdentityState = {
  userId: string
  email?: string
  access: GymAccess[]
}