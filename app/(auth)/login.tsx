import { login } from "@/api";
import { saveToken } from "@/api/client";
import { setItem } from "@/api/storage";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const { setName, setMail, setIsAuthenticated, setToken } = useAuth();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.success) {
        const { data, access_token } = result;
        await setItem("name", data.name);
        await setItem("email", data.email);
        await saveToken(access_token);
        setName(data.name);
        setMail(data.email);
        setToken(access_token);
        setIsAuthenticated(true);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-blue-50 px-7 pt-14 pb-8 items-center">
        <View className="w-13 h-13 bg-blue-500 rounded-2xl items-center justify-center mb-3">
          <Ionicons name="pulse" size={28} color="#EFF6FF" />
        </View>
        <Text className="text-blue-900 text-lg font-medium">HealthTracker</Text>
        <Text className="text-blue-600 text-xs mt-1">
          Your wellness, every day
        </Text>
      </View>

      <View className="px-6 pt-6 pb-8">
        <Text className="text-gray-900 text-base font-medium mb-5">
          Sign in
        </Text>
        <Text className="text-red-500 text-xs mb-3">{error}</Text>

        <View className="mb-4">
          <Text className="text-gray-500 text-xs mb-1">Email address</Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 gap-2">
            <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#D1D5DB"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              className="flex-1 text-sm text-gray-900"
            />
          </View>
        </View>

        <View className="mb-1">
          <Text className="text-gray-500 text-xs mb-1">Password</Text>
          <View className="flex-row items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#D1D5DB"
                secureTextEntry={!showPassword}
                className="flex-1 text-sm text-gray-900"
                value={password}
                onChangeText={setPassword}
              />
            </View>
            <Pressable onPress={() => setShowPassword((p) => !p)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={16}
                color="#9CA3AF"
              />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity className="self-end mb-5">
          <Text className="text-blue-500 text-xs">Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-500 rounded-lg py-3 items-center mb-4"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-blue-50 text-sm font-medium">Sign in</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3 mb-4">
          <View className="flex-1 h-px bg-gray-100" />
          <Text className="text-gray-400 text-xs">or continue with</Text>
          <View className="flex-1 h-px bg-gray-100" />
        </View>

        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2.5 bg-gray-50">
            <Ionicons name="logo-google" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-1.5 border border-gray-200 rounded-lg py-2.5 bg-gray-50">
            <Ionicons name="logo-apple" size={16} color="#6B7280" />
            <Text className="text-gray-500 text-sm">Apple</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center">
          <Text className="text-gray-400 text-xs">No account? </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 text-xs">
              <Link href="/signup">Create one</Link>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
