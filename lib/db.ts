import { supabase } from "./supabase"

export type AppRole = "owner" | "employee" | "member"

// ---------------------------
// Auth helpers
// ---------------------------
export async function getUserId() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const uid = data.session?.user?.id
  if (!uid) throw new Error("Auth session missing")
  return uid
}

// ---------------------------
// Profiles
// ---------------------------
export async function upsertProfile(input: { fullName: string }) {
  const userId = await getUserId()
  const fullName = input.fullName.trim()
  if (!fullName) throw new Error("Nombre requerido")

  const { error } = await supabase.from("profiles").upsert({
    id: userId, // ✅ tu schema usa profiles.id = auth.uid()
    full_name: fullName,
  })
  if (error) throw error
}

// ---------------------------
// Gyms
// ---------------------------
export async function createGym(input: { name: string; description?: string | null }) {
  const userId = await getUserId()
  const name = input.name.trim()
  const description = input.description?.trim() ? input.description.trim() : null

  if (!name) throw new Error("Nombre del gym requerido")

  const { data, error } = await supabase
    .from("gyms")
    .insert({
      owner_id: userId,
      name,
      description,
    })
    .select("id")
    .single()

  if (error) throw error
  if (!data?.id) throw new Error("No se pudo obtener el id del gym")
  return data.id as string
}

export async function consumeInvite(code: string) {
  const clean = code.trim().toUpperCase()
  if (!clean) throw new Error("Código requerido")

  const { data, error } = await supabase.rpc("consume_gym_invite", { p_code: clean })
  if (error) throw error
  return data as string
}

export async function joinGymAsMember(gymId: string) {
  const userId = await getUserId()
  const gid = gymId.trim()
  if (!gid) throw new Error("Gym inválido")

  const { error } = await supabase.from("memberships").insert({
    gym_id: gid,
    user_id: userId,
    status: "active",
  })
  if (error) throw error
}

export async function listGymsForDiscovery() {
  // Discovery público: gyms_public (vista/tabla que expone solo lo público)
  const { data, error } = await supabase
    .from("gyms_public")
    .select("gym_id,name,description,logo_path,is_open,timezone,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50)

  if (error) throw error

  return (data ?? []).map((x) => ({
    id: x.gym_id as string,
    name: x.name as string,
    description: (x.description as string | null) ?? null,
    is_open: Boolean(x.is_open),
  }))
}

// Owner gyms management
export type OwnerGym = {
  id: string
  name: string
  description: string | null
  is_open: boolean
  is_public: boolean
  created_at: string
}

export async function listOwnerGyms() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from("gyms")
    .select("id,name,description,is_open,is_public,created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as OwnerGym[]
}

export async function setGymPublic(gymId: string, isPublic: boolean) {
  const gid = gymId.trim()
  if (!gid) throw new Error("Gym inválido")

  const { error } = await supabase.from("gyms").update({ is_public: isPublic }).eq("id", gid)
  if (error) throw error
}

// ---------------------------
// Feed (posts)
// ---------------------------
export type FeedPost = {
  id: string
  gym_id: string
  gym_name: string | null
  author_id: string
  author_name: string | null
  content: string
  created_at: string
}

export async function listGlobalPosts(opts?: { gymId?: string; limit?: number }) {
  const limit = opts?.limit ?? 30

  let q = supabase
    .from("posts_feed")
    .select("id,gym_id,gym_name,author_id,author_name,content,created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (opts?.gymId) q = q.eq("gym_id", opts.gymId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as FeedPost[]
}

export async function createPost(input: { gymId: string; content: string }) {
  const userId = await getUserId()

  const gymId = input.gymId.trim()
  const content = input.content.trim()

  if (!gymId) throw new Error("Gym inválido")
  if (!content) throw new Error("Escribe algo para publicar")
  if (content.length > 2000) throw new Error("Máximo 2000 caracteres")

  const { error } = await supabase.from("posts").insert({
    gym_id: gymId,
    author_id: userId,
    content,
  })
  if (error) throw error
}