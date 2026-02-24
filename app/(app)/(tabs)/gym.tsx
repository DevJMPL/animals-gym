import React from "react"
import { Text, View } from "react-native"

export default function GymTab() {
  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
      <Text className="text-black dark:text-white text-3xl font-semibold">Gym</Text>
      <Text className="text-black/60 dark:text-white/60 mt-2">Info del gym activo (después)</Text>
    </View>
  )
}