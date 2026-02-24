import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, Text, TextInput, View } from "react-native"
import type { AppRole } from "../../lib/db"
import { supabase } from "../../lib/supabase"

export default function Register() {
  const [fullName, setFullName] = React.useState("")
  const [role, setRole] = React.useState<AppRole>("owner")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const onRegister = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName, role },
        },
      })
      if (error) throw error

      if (!data.session) {
        Alert.alert("Registro", "Revisa tu correo para confirmar tu cuenta.")
        router.replace("/login")
        return
      }

      if (role === "owner") router.replace("/register-owner")
      else if (role === "employee") router.replace("/register-employee")
      else router.replace("/register-member")
    } catch (e: any) {
      Alert.alert("Registro", e?.message ?? "No se pudo crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <Text className="text-black dark:text-white text-3xl font-semibold">Crear cuenta</Text>
      <Text className="text-black/70 dark:text-white/70 mt-2">Selecciona tu tipo de usuario</Text>

      <View className="mt-6 gap-3">
        <TextInput
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Nombre completo"
          placeholderTextColor="#9CA3AF"
          value={fullName}
          onChangeText={setFullName}
        />

        <View className="flex-row gap-2">
          {(["owner", "employee", "member"] as AppRole[]).map((r) => {
            const selected = role === r
            return (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                className={`flex-1 py-3 rounded-2xl items-center ${
                  selected ? "bg-black dark:bg-white" : "bg-black/5 dark:bg-white/10"
                }`}
              >
                <Text className={`${selected ? "text-white dark:text-black" : "text-black dark:text-white"} font-semibold`}>
                  {r === "owner" ? "Dueño" : r === "employee" ? "Empleado" : "Miembro"}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <TextInput
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="bg-black/5 dark:bg-white/10 text-black dark:text-white px-4 py-3 rounded-2xl"
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={onRegister}
          disabled={loading}
          className={`rounded-2xl py-3 items-center ${
            loading ? "opacity-60 bg-black dark:bg-white" : "bg-black dark:bg-white"
          }`}
        >
          <Text className="font-semibold text-white dark:text-black">
            {loading ? "Creando..." : "Crear cuenta"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text className="text-black/70 dark:text-white/70 text-center mt-4">Volver</Text>
        </Pressable>
      </View>
    </View>
  )
}