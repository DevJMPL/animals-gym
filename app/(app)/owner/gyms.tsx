import { useAccess } from "@/core/access/useAccess"
import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { createGym, listOwnerGyms, setGymPublic, type OwnerGym } from "../../../lib/db"

export default function OwnerGymsScreen() {
  const { can } = useAccess()
  const [gyms, setGyms] = React.useState<OwnerGym[]>([])
  const [loading, setLoading] = React.useState(false)
  const [loadedOnce, setLoadedOnce] = React.useState(false)

  const [newName, setNewName] = React.useState("")
  const [newDesc, setNewDesc] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const list = await listOwnerGyms()
      setGyms(list)
    } catch (e: any) {
      Alert.alert("Owner gyms", e?.message ?? "No se pudieron cargar tus gyms")
    } finally {
      setLoading(false)
      setLoadedOnce(true)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const onCreateGym = async () => {
    try {
      if (!can("gym.create")) throw new Error("No autorizado")
      if (!newName.trim()) throw new Error("Ingresa el nombre del gym")

      setLoading(true)
      await createGym({ name: newName.trim(), description: newDesc.trim() ? newDesc.trim() : null })
      setNewName("")
      setNewDesc("")
      await load()
    } catch (e: any) {
      Alert.alert("Crear gym", e?.message ?? "No se pudo crear el gym")
    } finally {
      setLoading(false)
    }
  }

  const onTogglePublish = async (gym: OwnerGym) => {
    try {
      if (!can("gym.publish", gym.id)) throw new Error("No autorizado para publicar este gym")

      setLoading(true)
      await setGymPublic(gym.id, !gym.is_public)
      await load()
    } catch (e: any) {
      Alert.alert("Publicar", e?.message ?? "No se pudo actualizar publicación")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
      <View className="flex-row items-center justify-between">
        <Text className="text-black dark:text-white text-2xl font-semibold">Mis gyms</Text>

        <Pressable onPress={() => router.back()}>
          <Text className="text-black/70 dark:text-white/70">Volver</Text>
        </Pressable>
      </View>

      <View className="mt-6 bg-black/5 dark:bg-white/10 rounded-2xl p-4">
        <Text className="text-black dark:text-white font-semibold">Crear nuevo gym</Text>

        <TextInput
          className="mt-3 bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Nombre del gym"
          placeholderTextColor="#9CA3AF"
          value={newName}
          onChangeText={setNewName}
        />

        <TextInput
          className="mt-3 bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Descripción (opcional)"
          placeholderTextColor="#9CA3AF"
          value={newDesc}
          onChangeText={setNewDesc}
        />

        <Pressable
          disabled={loading}
          onPress={onCreateGym}
          className={`mt-3 rounded-2xl py-3 items-center ${
            loading ? "opacity-60 bg-black dark:bg-white" : "bg-black dark:bg-white"
          }`}
        >
          <Text className="font-semibold text-white dark:text-black">
            {loading ? "Creando..." : "Crear gym"}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {!loadedOnce ? (
          <Text className="text-black/60 dark:text-white/60">Cargando...</Text>
        ) : gyms.length === 0 ? (
          <Text className="text-black/60 dark:text-white/60">
            Aún no tienes gyms. Crea el primero arriba.
          </Text>
        ) : (
          <View className="gap-3">
            {gyms.map((g) => (
              <View key={g.id} className="bg-black/5 dark:bg-white/10 rounded-2xl p-4">
                <Text className="text-black dark:text-white text-lg font-semibold">{g.name}</Text>

                {!!g.description && (
                  <Text className="text-black/70 dark:text-white/70 mt-1">{g.description}</Text>
                )}

                <View className="mt-3 flex-row justify-between">
                  <Text className="text-black/60 dark:text-white/60">
                    {g.is_public ? "Publicado" : "No publicado"}
                  </Text>
                  <Text className="text-black/60 dark:text-white/60">
                    {g.is_open ? "Abierto" : "Cerrado"}
                  </Text>
                </View>

                <Pressable
                  disabled={loading}
                  onPress={() => onTogglePublish(g)}
                  className={`mt-3 rounded-2xl py-3 items-center ${
                    loading
                      ? "opacity-60 bg-black/10 dark:bg-white/20"
                      : g.is_public
                        ? "bg-black/10 dark:bg-white/20"
                        : "bg-black dark:bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      loading
                        ? "text-black dark:text-white"
                        : g.is_public
                          ? "text-black dark:text-white"
                          : "text-white dark:text-black"
                    }`}
                  >
                    {loading ? "Actualizando..." : g.is_public ? "Quitar de público" : "Publicar"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}