// providers/ThemeProvider.tsx
import AsyncStorage from "@react-native-async-storage/async-storage"
import React from "react"
import { useColorScheme as useRNColorScheme, type ColorSchemeName } from "react-native"

// ⚠️ NativeWind lo marca deprecated en d.ts, pero es lo que permite SETEAR el scheme.
// Tipamos nosotros para evitar warnings/ruido.
import { useColorScheme as useNWColorScheme } from "nativewind"

type ThemeMode = "light" | "dark" | "system"

type ThemeCtx = {
  mode: ThemeMode
  resolved: "light" | "dark"
  setMode: (m: ThemeMode) => Promise<void>
  toggle: () => Promise<void>
}

const ThemeContext = React.createContext<ThemeCtx | null>(null)
const KEY = "animals_gym_theme_mode"

function normalizeScheme(s: ColorSchemeName): "light" | "dark" {
  return s === "dark" ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Sistema (solo lectura)
  const systemScheme = useRNColorScheme() // "light" | "dark" | null

  // NativeWind (escritura + lectura interna)
  const nw = useNWColorScheme() as {
    colorScheme: ColorSchemeName
    setColorScheme: (scheme: ColorSchemeName) => void
  }

  // ✅ default claro
  const [mode, setModeState] = React.useState<ThemeMode>("light")
  const [hydrated, setHydrated] = React.useState(false)

  const resolved: "light" | "dark" =
    mode === "system" ? normalizeScheme(systemScheme) : mode

  const apply = React.useCallback(
    async (nextMode: ThemeMode) => {
      setModeState(nextMode)
      await AsyncStorage.setItem(KEY, nextMode)

      const nextResolved: "light" | "dark" =
        nextMode === "system" ? normalizeScheme(systemScheme) : nextMode

      // ✅ NativeWind no acepta "system" aquí: siempre pasamos light/dark
      nw.setColorScheme(nextResolved)
    },
    // systemScheme cambia cuando cambia el sistema (si estás en mode system)
    [nw, systemScheme]
  )

  // ✅ 1) fuerza light ANTES de mostrar UI (evita flash dark)
  React.useLayoutEffect(() => {
    nw.setColorScheme("light")
  }, [nw])

  // ✅ 2) hidrata modo guardado (si existe). Si no existe, se queda en light.
  React.useEffect(() => {
    ;(async () => {
      const saved = (await AsyncStorage.getItem(KEY)) as ThemeMode | null
      if (saved) {
        await apply(saved)
      } else {
        // deja light como default, pero persiste para consistencia
        await AsyncStorage.setItem(KEY, "light")
        nw.setColorScheme("light")
      }
      setHydrated(true)
    })()
  }, [apply, nw])

  // ✅ 3) si el usuario eligió "system", reflejar cambios del sistema
  React.useEffect(() => {
    if (!hydrated) return
    if (mode !== "system") return
    nw.setColorScheme(normalizeScheme(systemScheme))
  }, [mode, systemScheme, hydrated, nw])

  const setMode = React.useCallback(
    async (m: ThemeMode) => {
      await apply(m)
    },
    [apply]
  )

  const toggle = React.useCallback(async () => {
    const currentResolved = resolved
    await apply(currentResolved === "dark" ? "light" : "dark")
  }, [apply, resolved])

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeMode() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider")
  return ctx
}