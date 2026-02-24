import { useAccess } from "@/core/access/useAccess"
import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, Text, View } from "react-native"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../providers/AuthProvider"
import { useThemeMode } from "../../providers/ThemeProvider"

export default function Dashboard() {
  const { activeGymId, activeLevel } = useAccess()
  const { toggle, mode } = useThemeMode()
  const { session } = useAuth()

  const [email, setEmail] = React.useState<string>("")

  const role = (session?.user?.user_metadata?.role as string | undefined) ?? ""
  const isOwner = role === "owner"

  React.useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      setEmail(data.session?.user?.email ?? "")
    })()
  }, [])

  const onLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (e: any) {
      Alert.alert("Logout", e?.message ?? "No se pudo cerrar sesión")
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <Text className="text-black dark:text-white text-3xl font-semibold">Dashboard</Text>
      <Text className="text-black/70 dark:text-white/70 mt-2">Sesión activa ✅</Text>
      {!!email && <Text className="text-black/50 dark:text-white/50 mt-2">{email}</Text>}

      <Text className="text-black/60 dark:text-white/60 mt-4">
        Gym activo: {activeGymId ?? "Ninguno"} {activeLevel ? `(${activeLevel})` : ""}
      </Text>

      <Pressable
        onPress={() => router.push("/gym-switcher")}
        className="mt-4 bg-black dark:bg-white rounded-2xl py-3 items-center"
      >
        <Text className="text-white dark:text-black font-semibold">Cambiar gym</Text>
      </Pressable>

      {isOwner && (
        <Pressable
          onPress={() => router.push("/owner/gyms")}
          className="mt-4 bg-black dark:bg-white rounded-2xl py-3 items-center"
        >
          <Text className="text-white dark:text-black font-semibold">Mis gyms</Text>
        </Pressable>
      )}

      <Pressable
        onPress={toggle}
        className="mt-4 bg-black/10 dark:bg-white/20 rounded-2xl py-3 items-center"
      >
        <Text className="text-black dark:text-white font-semibold">
          Cambiar tema (actual: {mode})
        </Text>
      </Pressable>

      <Pressable
        onPress={onLogout}
        className="mt-4 bg-black/10 dark:bg-white/20 rounded-2xl py-3 items-center"
      >
        <Text className="text-black dark:text-white font-semibold">Cerrar sesión</Text>
      </Pressable>
    </View>
  )
}