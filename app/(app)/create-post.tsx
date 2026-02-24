import { useAccess } from "@/core/access/useAccess"
import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, Text, TextInput, View } from "react-native"
import { createPost } from "../../lib/db"

export default function CreatePost() {
  const { activeGymId, gyms } = useAccess()
  const [draft, setDraft] = React.useState("")
  const [posting, setPosting] = React.useState(false)

  const canPost = gyms.length > 0
  const postGymId = activeGymId ?? (gyms[0]?.gymId ?? null)

  const onSubmit = async () => {
    try {
      if (!canPost) throw new Error("Aún no tienes un gym asignado para publicar.")
      if (!postGymId) throw new Error("Selecciona un gym para publicar.")
      setPosting(true)
      await createPost({ gymId: postGymId, content: draft })
      router.back()
    } catch (e: any) {
      Alert.alert("Publicar", e?.message ?? "No se pudo publicar")
    } finally {
      setPosting(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-14">
      <View className="flex-row items-center justify-between">
        <Text className="text-black dark:text-white text-2xl font-semibold">Nueva publicación</Text>

        <Pressable onPress={() => router.back()}>
          <Text className="text-black/70 dark:text-white/70 font-semibold">Cerrar</Text>
        </Pressable>
      </View>

      <Text className="text-black/60 dark:text-white/60 mt-3">
        Publica en: {postGymId ?? "—"} {activeGymId ? "(activo)" : ""}
      </Text>

      <TextInput
        className="mt-4 bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
        placeholder={canPost ? "Escribe algo..." : "Necesitas un gym asignado"}
        placeholderTextColor="#9CA3AF"
        editable={canPost && !posting}
        value={draft}
        onChangeText={setDraft}
        multiline
      />

      <Pressable
        disabled={!canPost || posting || !draft.trim()}
        onPress={onSubmit}
        className={`mt-4 rounded-2xl py-3 items-center ${
          !canPost || posting || !draft.trim()
            ? "bg-black/20 dark:bg-white/20"
            : "bg-black dark:bg-white"
        }`}
      >
        <Text
          className={`font-semibold ${
            !canPost || posting || !draft.trim()
              ? "text-black/60 dark:text-white/70"
              : "text-white dark:text-black"
          }`}
        >
          {posting ? "Publicando..." : "Publicar"}
        </Text>
      </Pressable>
    </View>
  )
}