import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, Text, TextInput, View } from "react-native"
import { createGym, upsertProfile } from "../../lib/db"
import { supabase } from "../../lib/supabase"

export default function RegisterOwner() {
  const [fullName, setFullName] = React.useState("")
  const [gymName, setGymName] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const metaName = (data.session?.user?.user_metadata?.full_name as string | undefined) ?? ""
      if (metaName) setFullName(metaName)
    })()
  }, [])

  const onContinue = async () => {
    try {
      setLoading(true)
      if (!fullName.trim()) throw new Error("Ingresa tu nombre")
      if (!gymName.trim()) throw new Error("Ingresa el nombre del gym")

      await upsertProfile({ fullName: fullName.trim() })
      await createGym({ name: gymName.trim() })

      router.replace("/dashboard")
    } catch (e: any) {
      Alert.alert("Owner setup", e?.message ?? "No se pudo completar el registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <Text className="text-black dark:text-white text-2xl font-semibold">Configurar dueño</Text>
      <Text className="text-black/70 dark:text-white/70 mt-2">Crea tu primer gym</Text>

      <View className="mt-6 gap-3">
        <TextInput
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Tu nombre"
          placeholderTextColor="#9CA3AF"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Nombre del gym"
          placeholderTextColor="#9CA3AF"
          value={gymName}
          onChangeText={setGymName}
        />

        <Pressable
          onPress={onContinue}
          disabled={loading}
          className={`rounded-2xl py-3 items-center ${
            loading ? "opacity-60 bg-black dark:bg-white" : "bg-black dark:bg-white"
          }`}
        >
          <Text className="font-semibold text-white dark:text-black">
            {loading ? "Guardando..." : "Continuar"}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}