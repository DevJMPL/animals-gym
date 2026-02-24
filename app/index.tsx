import { Redirect } from "expo-router"
import React from "react"
import { useAuth } from "../providers/AuthProvider"

export default function Index() {
  const { session, isLoading } = useAuth()
  if (isLoading) return null
  return session ? <Redirect href="/home" /> : <Redirect href="/login" />
}