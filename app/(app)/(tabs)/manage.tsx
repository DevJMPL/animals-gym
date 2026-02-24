import { router } from "expo-router"
import React from "react"
import { Pressable, Text, View } from "react-native"
import { useAuth } from "../../../providers/AuthProvider"

export default function ManageTab() {
  const { session } = useAuth()
  const role = (session?.user?.user_metadata?.role as string | undefined) ?? ""
  const canManage = role === "owner" || role === "staff"

  if (!canManage) {
    return (
      <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
        <Text className="text-black dark:text-white text-2xl font-semibold">No autorizado</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
      <Text className="text-black dark:text-white text-3xl font-semibold">Admin</Text>

      <Pressable
        onPress={() => router.push("/owner/gyms")}
        className="mt-6 bg-black dark:bg-white rounded-2xl py-3 items-center"
      >
        <Text className="text-white dark:text-black font-semibold">Mis gyms</Text>
      </Pressable>
    </View>
  )
}