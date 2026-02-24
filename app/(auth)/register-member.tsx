import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { joinGymAsMember, listGymsForDiscovery, upsertProfile } from "../../lib/db"
import { supabase } from "../../lib/supabase"

type GymItem = { id: string; name: string; description: string | null; is_open: boolean }

export default function RegisterMember() {
  const [fullName, setFullName] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [gyms, setGyms] = React.useState<GymItem[]>([])

  React.useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const metaName = (data.session?.user?.user_metadata?.full_name as string | undefined) ?? ""
      if (metaName) setFullName(metaName)

      try {
        const list = (await listGymsForDiscovery()) as GymItem[]
        setGyms(list)
      } catch (e: any) {
        Alert.alert("Discovery", e?.message ?? "No se pudo cargar la lista pública")
        setGyms([])
      }
    })()
  }, [])

  const onJoin = async (gymId: string) => {
    try {
      setLoading(true)
      if (!fullName.trim()) throw new Error("Ingresa tu nombre")

      await upsertProfile({ fullName: fullName.trim() })
      await joinGymAsMember(gymId)

      router.replace("/dashboard")
    } catch (e: any) {
      Alert.alert("Member setup", e?.message ?? "No se pudo completar la suscripción")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 pt-16">
      <Text className="text-black dark:text-white text-2xl font-semibold">Configurar miembro</Text>
      <Text className="text-black/70 dark:text-white/70 mt-2">Elige un gym para suscribirte</Text>

      <View className="mt-6 gap-3">
        <TextInput
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Tu nombre"
          placeholderTextColor="#9CA3AF"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <ScrollView className="mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {gyms.length === 0 ? (
          <Text className="text-black/60 dark:text-white/60">
            No hay gyms públicos publicados todavía.
          </Text>
        ) : (
          <View className="gap-3">
            {gyms.map((g) => (
              <View key={g.id} className="bg-black/5 dark:bg-white/10 rounded-2xl p-4">
                <Text className="text-black dark:text-white text-lg font-semibold">{g.name}</Text>

                {!!g.description && (
                  <Text className="text-black/70 dark:text-white/70 mt-1">{g.description}</Text>
                )}

                <Text className="text-black/60 dark:text-white/60 mt-2">
                  {g.is_open ? "Abierto" : "Cerrado"}
                </Text>

                <Pressable
                  disabled={loading}
                  onPress={() => onJoin(g.id)}
                  className={`mt-3 rounded-2xl py-3 items-center ${
                    loading ? "opacity-60 bg-black dark:bg-white" : "bg-black dark:bg-white"
                  }`}
                >
                  <Text className="font-semibold text-white dark:text-black">
                    {loading ? "Procesando..." : "Unirme"}
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