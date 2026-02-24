import { useAccess } from "@/core/access/useAccess"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { Alert, FlatList, Pressable, Text, View, useColorScheme } from "react-native"
import { listGlobalPosts, type FeedPost } from "../../../lib/db"

type Filter = "global" | "active"

export default function Home() {
  const { activeGymId } = useAccess()
  const scheme = useColorScheme()
  const isDark = scheme === "dark"

  const [filter, setFilter] = React.useState<Filter>("global")
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<FeedPost[]>([])

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      const gymId = filter === "active" ? activeGymId ?? undefined : undefined
      const data = await listGlobalPosts({ gymId, limit: 30 })
      setItems(data)
    } catch (e: any) {
      Alert.alert("Feed", e?.message ?? "No se pudo cargar el feed")
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [filter, activeGymId])

  React.useEffect(() => {
    void load()
  }, [load])

  const FilterBtn = ({
    label,
    active,
    onPress,
  }: {
    label: string
    active: boolean
    onPress: () => void
  }) => (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-2xl ${
        active ? "bg-black dark:bg-white" : "bg-black/5 dark:bg-white/10"
      }`}
    >
      <Text className={`font-semibold ${active ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
        {label}
      </Text>
    </Pressable>
  )

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Header */}
      <View className="px-6 pt-14 pb-4 border-b border-black/10 dark:border-white/10">
        <Text className="text-black dark:text-white text-3xl font-semibold">Inicio</Text>
        <Text className="text-black/60 dark:text-white/60 mt-1">
          {filter === "global" ? "Publicaciones globales" : "Solo mi gym activo"}
        </Text>

        <View className="mt-3 flex-row gap-2 items-center">
          <FilterBtn label="Global" active={filter === "global"} onPress={() => setFilter("global")} />
          <FilterBtn label="Mi gym" active={filter === "active"} onPress={() => setFilter("active")} />

          <Pressable
            onPress={() => router.push("/gym-switcher")}
            className="ml-auto px-4 py-2 rounded-2xl bg-black/10 dark:bg-white/20"
          >
            <Text className="text-black dark:text-white font-semibold">Elegir gym</Text>
          </Pressable>
        </View>
      </View>

      {/* Feed */}
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }} // deja espacio para FAB
        ListEmptyComponent={
          <Text className="text-black/60 dark:text-white/60">
            {loading ? "Cargando..." : "Aún no hay publicaciones."}
          </Text>
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-2xl p-4 bg-black/5 dark:bg-white/10">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-black dark:text-white font-semibold">
                  {item.gym_name ?? item.gym_id}
                </Text>
                {!!item.author_name && (
                  <Text className="text-black/60 dark:text-white/60 mt-1">{item.author_name}</Text>
                )}
              </View>
              <Text className="text-black/40 dark:text-white/40 text-xs">
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>

            <Text className="text-black dark:text-white mt-3">{item.content}</Text>
          </View>
        )}
      />

      {/* FAB (Create Post) */}
      <Pressable
        onPress={() => router.push("/create-post")}
        className="absolute right-6 bottom-8 h-14 w-14 rounded-full bg-black dark:bg-white items-center justify-center"
        style={{
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={28} color={isDark ? "black" : "white"} />
      </Pressable>
    </View>
  )
}