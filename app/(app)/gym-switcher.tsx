import { useAccess } from "@/core/access/useAccess"
import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"

export default function GymSwitcher() {
  const { gyms, activeGymId, setActiveGymId, activeLevel } = useAccess()
  const [loading, setLoading] = React.useState(false)

  const onSelect = async (gymId: string) => {
    try {
      setLoading(true)
      await setActiveGymId(gymId)
      router.back()
    } catch (e: any) {
      Alert.alert("Gym switcher", e?.message ?? "No se pudo cambiar el gym")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
      <View className="flex-row justify-between items-center">
        <Text className="text-black dark:text-white text-2xl font-semibold">Cambiar gym</Text>

        <Pressable onPress={() => router.back()}>
          <Text className="text-black/70 dark:text-white/70">Cerrar</Text>
        </Pressable>
      </View>

      <Text className="text-black/60 dark:text-white/60 mt-2">
        Activo: {activeGymId ?? "Ninguno"} {activeLevel ? `(${activeLevel})` : ""}
      </Text>

      <ScrollView className="mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {gyms.length === 0 ? (
          <Text className="text-black/60 dark:text-white/60">
            No tienes gyms asignados todavía.
          </Text>
        ) : (
          <View className="gap-3">
            {gyms.map((g) => {
              const selected = g.gymId === activeGymId

              return (
                <Pressable
                  key={g.gymId}
                  disabled={loading}
                  onPress={() => onSelect(g.gymId)}
                  className={`rounded-2xl p-4 ${
                    selected
                      ? "bg-black/10 dark:bg-white/20"
                      : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  <Text className="text-black dark:text-white font-semibold">
                    {g.gymId}
                  </Text>

                  <Text className="text-black/70 dark:text-white/70 mt-1">
                    Nivel: {g.level}
                  </Text>

                  {selected && (
                    <Text className="text-black/60 dark:text-white/60 mt-1">
                      Seleccionado
                    </Text>
                  )}
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}