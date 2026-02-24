const path = require("path")
const { getDefaultConfig } = require("expo/metro-config")
const { withReactNativeCSS } = require("react-native-css/metro")

let config = getDefaultConfig(__dirname)

// ✅ Alias @ -> ./src
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  "@": path.resolve(__dirname, "src"),
}

// ✅ Wrapper de CSS (requerido por NativeWind/react-native-css)
// Debe aplicarse AL FINAL (innermost según su mensaje; aquí es el último paso real)
config = withReactNativeCSS(config, { input: "./styles/global.css" })

module.exports = config