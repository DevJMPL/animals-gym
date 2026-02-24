import { router } from "expo-router"
import React from "react"
import { Alert, Pressable, Text, TextInput, View } from "react-native"
import { supabase } from "../../lib/supabase"

export default function Login() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const onLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error

      // ✅ Deja que el AuthGuard elija: /register-owner o /dashboard
      router.replace("/")
    } catch (e: any) {
      Alert.alert("Login", e?.message ?? "No se pudo iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 justify-center">
      <Text className="text-black dark:text-white text-3xl font-semibold">Animals Gym</Text>
      <Text className="text-black/70 dark:text-white/70 mt-2">Inicia sesión</Text>

      <View className="mt-8 gap-3">
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
          className={`rounded-2xl py-3 items-center ${
            loading ? "opacity-60 bg-black dark:bg-white" : "bg-black dark:bg-white"
          }`}
          onPress={onLogin}
          disabled={loading}
        >
          <Text className="font-semibold text-white dark:text-black">
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/register")}>
          <Text className="text-black/80 dark:text-white/80 text-center mt-4">Crear cuenta</Text>
        </Pressable>
      </View>
    </View>
  )
}