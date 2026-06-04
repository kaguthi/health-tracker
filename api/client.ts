import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN = "JWT_TOKEN";

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    sessionStorage.setItem(TOKEN, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return sessionStorage.getItem(TOKEN);
  }
  return await SecureStore.getItemAsync(TOKEN);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === "web") {
    sessionStorage.removeItem(TOKEN);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN);
}
