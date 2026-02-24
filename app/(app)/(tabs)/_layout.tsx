import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React from "react"
import { useAuth } from "../../../providers/AuthProvider"

export default function TabsLayout() {
  const { session } = useAuth()
  const role = (session?.user?.user_metadata?.role as string | undefined) ?? ""
  const canManage = role === "owner" || role === "staff"

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // ✅ quita texto
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="gym"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "barbell" : "barbell-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="manage"
        options={{
          href: canManage ? undefined : null,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}