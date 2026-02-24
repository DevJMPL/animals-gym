import { IdentityProvider, useIdentity } from "@/core/identity/IdentityProvider"
import { ActiveGymProvider } from "@/core/tenant/ActiveGymProvider"
import { Stack, router, usePathname, useRootNavigationState, useSegments } from "expo-router"
import React from "react"
import { ActivityIndicator, View } from "react-native"
import { AuthProvider, useAuth } from "../providers/AuthProvider"
import { ThemeProvider } from "../providers/ThemeProvider"
import "../styles/global.css"

function AuthGuard() {
  const { session, isLoading } = useAuth()
  const { identity, loading: identityLoading } = useIdentity()

  const segments = useSegments()
  const pathname = usePathname()
  const navState = useRootNavigationState()

  const last = React.useRef<string>("")

  React.useEffect(() => {
    if (!navState?.key) return
    if (isLoading || identityLoading) return

    const root = segments[0]
    if (!root) return

    const inAuthGroup = root === "(auth)"

    // 1) Sin sesión -> login (si no estás ya en auth/login)
    if (!session) {
      if (!inAuthGroup && pathname !== "/login") router.replace("/login")
      return
    }

    // 2) Con sesión -> decide si necesita onboarding de owner
    const role = (session.user.user_metadata?.role as string | undefined) ?? ""
    const hasAnyGymAccess = (identity?.access?.length ?? 0) > 0
    const needsOwnerOnboarding = role === "owner" && !hasAnyGymAccess

    const target = needsOwnerOnboarding ? "/register-owner" : "/home"

    // ✅ evita loops
    if (pathname === target) return
    if (last.current === target) return
    last.current = target

    // 3) Si estás en auth (login/register/...) y ya hay sesión, manda al target correcto
    if (inAuthGroup) {
      router.replace(target)
      return
    }

    // 4) Si estás en app pero el target es onboarding (auth), manda también
    if (!inAuthGroup && needsOwnerOnboarding) {
      router.replace(target)
    }
  }, [session, isLoading, identityLoading, identity, segments, navState?.key, pathname])

  return null
}

function AppBoot() {
  const { isLoading } = useAuth()
  const { loading: identityLoading } = useIdentity()
  const navState = useRootNavigationState()

  if (isLoading || identityLoading || !navState?.key) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <AuthGuard />
    </>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IdentityProvider>
          <ActiveGymProvider>
            <AppBoot />
          </ActiveGymProvider>
        </IdentityProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}