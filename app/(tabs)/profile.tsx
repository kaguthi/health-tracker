import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname, useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const stats = [
  { value: "12", label: "Day streak" },
  { value: "143", label: "Workouts" },
  { value: "8.4 kg", label: "Lost" },
] as const;

const bodyStats = [
  { label: "Age", value: "28", unit: "yrs", color: undefined },
  { label: "Height", value: "175", unit: "cm", color: undefined },
  { label: "Weight", value: "71.5", unit: "kg", color: undefined },
  { label: "BMI", value: "22.4", unit: "Normal", color: "#1D9E75" },
] as const;

const settingsRows = [
  {
    icon: "flag-outline",
    label: "Goals & targets",
    color: "#1D9E75",
    bg: "#E1F5EE",
    href: "/goals",
  },
  {
    icon: "notifications-outline",
    label: "Notifications",
    color: "#378ADD",
    bg: "#E6F1FB",
    href: "/notifications",
  },
  {
    icon: "shield-outline",
    label: "Privacy & data",
    color: "#7F77DD",
    bg: "#EEEDFE",
    href: "/privacy",
  },
  {
    icon: "watch-outline",
    label: "Connected devices",
    color: "#BA7517",
    bg: "#FAEEDA",
    href: "/devices",
  },
] as const;

export default function ProfileScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { name, mail, logout } = useAuth();

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <View className="bg-blue-50 px-5 pt-5 pb-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-blue-900 text-base font-medium">Profile</Text>
            <TouchableOpacity
              className="w-8 h-8 rounded-lg bg-blue-200 items-center justify-center"
              onPress={() => router.push("/profile-edit")}
            >
              <Ionicons name="pencil-outline" size={15} color="#0C447C" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-3.5">
            <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
              <Text className="text-blue-50 text-xl font-medium">
                {name?.slice(0, 2).toUpperCase() || "AL"}
              </Text>
            </View>
            <View>
              <Text className="text-blue-900 text-lg font-medium">
                {name || "Alex Johnson"}
              </Text>
              <Text className="text-blue-600 text-xs mt-0.5">
                {mail || "alex.johnson@email.com"}
              </Text>
              <View className="flex-row items-center gap-1 mt-1.5 bg-blue-200 self-start rounded-full px-2.5 py-0.5">
                <Ionicons name="star-outline" size={11} color="#0C447C" />
                <Text className="text-blue-900 text-xs font-medium">
                  Pro member
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4">
          <View className="flex-row gap-2 mb-4">
            {stats.map(({ value, label }) => (
              <View
                key={label}
                className="flex-1 bg-gray-50 rounded-xl py-2.5 items-center"
              >
                <Text className="text-gray-900 text-lg font-medium">
                  {value}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">{label}</Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
            Body stats
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {bodyStats.map(({ label, value, unit, color }) => (
              <View
                key={label}
                className="border border-gray-100 rounded-xl p-3"
                style={{ width: "48%" }}
              >
                <Text className="text-gray-400 text-xs mb-1">{label}</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text
                    className="text-base font-medium"
                    style={{ color: color ?? undefined }}
                  >
                    {value}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: color ?? "#9CA3AF" }}
                  >
                    {unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
            Settings
          </Text>
          <View className="border border-gray-100 rounded-xl overflow-hidden mb-4">
            {settingsRows.map(({ icon, label, color, bg, href }, i) => (
              <Link key={label} href={href} asChild>
                <TouchableOpacity
                  className="flex-row items-center gap-2.5 px-3 py-2.5"
                  style={{
                    borderBottomWidth: i < settingsRows.length - 1 ? 0.5 : 0,
                    borderBottomColor: "#F3F4F6",
                  }}
                >
                  <View
                    className="w-7 h-7 rounded-lg items-center justify-center"
                    style={{ backgroundColor: bg }}
                  >
                    <Ionicons name={icon} size={14} color={color} />
                  </View>
                  <Text className="flex-1 text-gray-900 text-sm">{label}</Text>
                  <Ionicons
                    name="chevron-forward-outline"
                    size={14}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </Link>
            ))}
          </View>

          <Text className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">
            Account
          </Text>
          <View className="border border-gray-100 rounded-xl overflow-hidden mb-6">
            <Link href="./help" asChild>
              <TouchableOpacity className="flex-row items-center gap-2.5 px-3 py-2.5 border-b border-gray-100">
                <View className="w-7 h-7 rounded-lg items-center justify-center bg-green-50">
                  <Ionicons
                    name="help-circle-outline"
                    size={14}
                    color="#0F6E56"
                  />
                </View>
                <Text className="flex-1 text-gray-900 text-sm">
                  Help & support
                </Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={14}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              className="flex-row items-center gap-2.5 px-3 py-2.5"
              onPress={handleSignOut}
            >
              <View className="w-7 h-7 rounded-lg items-center justify-center bg-red-50">
                <Ionicons name="log-out-outline" size={14} color="#A32D2D" />
              </View>
              <Text className="text-sm" style={{ color: "#A32D2D" }}>
                Sign out
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
