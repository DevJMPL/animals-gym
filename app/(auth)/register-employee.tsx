import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, Text, TextInput, View } from "react-native"
import { consumeInvite, upsertProfile } from "../../lib/db"
import { supabase } from "../../lib/supabase"

export default function RegisterEmployee() {
  const [fullName, setFullName] = React.useState("")
  const [code, setCode] = React.useState("")
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
      if (!code.trim()) throw new Error("Ingresa el código de invitación")

      await upsertProfile({ fullName: fullName.trim() })
      await consumeInvite(code.trim())

      router.replace("/dashboard")
    } catch (e: any) {
      Alert.alert("Employee setup", e?.message ?? "No se pudo validar el código")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <Text className="text-black dark:text-white text-2xl font-semibold">Configurar empleado</Text>
      <Text className="text-black/70 dark:text-white/70 mt-2">Ingresa el código de invitación</Text>

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
          placeholder="Código (ej. AB12-CD34)"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
        />

        <Pressable
          onPress={onContinue}
          disabled={loading}
          className={`rounded-2xl py-3 items-center ${
            loading ? "opacity-60 bg-black dark:bg-white" : "bg-black dark:bg-white"
          }`}
        >
          <Text className="font-semibold text-white dark:text-black">
            {loading ? "Validando..." : "Continuar"}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}