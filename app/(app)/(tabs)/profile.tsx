import React from "react"
import { Alert, Pressable, Text, View } from "react-native"
import { supabase } from "../../../lib/supabase"
import { useThemeMode } from "../../../providers/ThemeProvider"

export default function ProfileTab() {
  const { toggle, mode } = useThemeMode()

  const onLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (e: any) {
      Alert.alert("Logout", e?.message ?? "No se pudo cerrar sesión")
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
      <Text className="text-black dark:text-white text-3xl font-semibold">Perfil</Text>

      <Pressable
        onPress={toggle}
        className="mt-6 bg-black/10 dark:bg-white/20 rounded-2xl py-3 items-center"
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