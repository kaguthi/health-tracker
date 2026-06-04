import { AuthProvider } from "@/hooks/useAuth";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";
function LayoutContent() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(page)" />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [fontLoaded] = useFonts({
    "Monsterrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Monsterrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Monsterrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Monsterrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Monsterrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Monsterrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
  });
  useEffect(() => {
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) return null;
  return (
    <AuthProvider>
      <LayoutContent />
    </AuthProvider>
  );
}
