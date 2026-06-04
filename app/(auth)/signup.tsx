import { addUser } from "@/api";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "", color: "#E5E7EB" },
    { label: "Weak", color: "#E24B4A" },
    { label: "Fair", color: "#EF9F27" },
    { label: "Good", color: "#1D9E75" },
    { label: "Strong", color: "#0F6E56" },
  ];
  return { score, ...levels[score] };
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const strength = getStrength(password);
  const passwordsMatch = confirm.length > 0 && confirm === password;
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await addUser(name, email, password);
      router.replace("/");
    } catch (e: any) {
      setError(e.message);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-blue-50 px-7 pt-12 pb-7 items-center">
        <View className="w-13 h-13 bg-blue-500 rounded-2xl items-center justify-center mb-3">
          <Ionicons name="pulse" size={28} color="#EFF6FF" />
        </View>
        <Text className="text-blue-900 text-lg font-medium">HealthTracker</Text>
        <Text className="text-blue-600 text-xs mt-1">
          Start your wellness journey
        </Text>
      </View>

      <View className="px-6 pt-5 pb-8">
        <Text className="text-gray-900 text-base font-medium mb-4">
          Create account
        </Text>
        <Text className="text-red-500 text-xs mb-3">{error}</Text>

        <View className="mb-3">
          <Text className="text-gray-500 text-xs mb-1">Full name</Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 gap-2">
            <Ionicons name="person-outline" size={16} color="#9CA3AF" />
            <TextInput
              placeholder="Alex Johnson"
              placeholderTextColor="#D1D5DB"
              autoCapitalize="words"
              className="flex-1 text-sm text-gray-900"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-gray-500 text-xs mb-1">Email address</Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 gap-2">
            <Ionicons name="mail-outline" size={16} color="#9CA3AF" />
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#D1D5DB"
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 text-sm text-gray-900"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-gray-500 text-xs mb-1">Password</Text>
          <View className="flex-row items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#D1D5DB"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
                className="flex-1 text-sm text-gray-900"
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
          {password.length > 0 && (
            <View className="mt-1.5">
              <View className="flex-row gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    className="flex-1 h-1 rounded-full"
                    style={{
                      backgroundColor:
                        i <= strength.score ? strength.color : "#E5E7EB",
                    }}
                  />
                ))}
              </View>
              <Text className="text-xs mt-1" style={{ color: strength.color }}>
                {strength.label} password
              </Text>
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-gray-500 text-xs mb-1">Confirm password</Text>
          <View
            className="flex-row items-center justify-between rounded-lg px-3 py-2.5 bg-gray-50"
            style={{
              borderWidth: 0.5,
              borderColor:
                confirm.length > 0
                  ? passwordsMatch
                    ? "#1D9E75"
                    : "#E24B4A"
                  : "#E5E7EB",
            }}
          >
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={
                  confirm.length > 0
                    ? passwordsMatch
                      ? "#1D9E75"
                      : "#E24B4A"
                    : "#9CA3AF"
                }
              />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#D1D5DB"
                secureTextEntry={!showConfirm}
                onChangeText={setConfirm}
                value={confirm}
                className="flex-1 text-sm text-gray-900"
              />
            </View>
            <Pressable onPress={() => setShowConfirm((p) => !p)}>
              <Ionicons
                name={
                  confirm.length > 0 && passwordsMatch
                    ? "checkmark-circle-outline"
                    : "eye-outline"
                }
                size={16}
                color={
                  confirm.length > 0 && passwordsMatch ? "#1D9E75" : "#9CA3AF"
                }
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          className="flex-row items-start gap-2 mb-5"
          onPress={() => setAgreed((a) => !a)}
        >
          <View
            className="w-4 h-4 rounded items-center justify-center mt-0.5"
            style={{
              backgroundColor: agreed ? "#3B82F6" : "transparent",
              borderWidth: 1,
              borderColor: agreed ? "#3B82F6" : "#D1D5DB",
            }}
          >
            {agreed && <Ionicons name="checkmark" size={11} color="white" />}
          </View>
          <Text className="text-xs text-gray-500 flex-1 leading-5">
            I agree to the{" "}
            <Text className="text-blue-500">Terms of Service</Text> and{" "}
            <Text className="text-blue-500">Privacy Policy</Text>
          </Text>
        </Pressable>

        <TouchableOpacity
          className="rounded-lg py-3 items-center mb-4"
          style={{ backgroundColor: agreed ? "#3B82F6" : "#BFDBFE" }}
          disabled={!agreed}
          onPress={handleSignUp}
        >
          <Text className="text-blue-50 text-sm font-medium">
            Create account
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-400 text-xs">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity>
            <Text className="text-blue-500 text-xs">
              <Link href="/login">Sign in</Link>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
