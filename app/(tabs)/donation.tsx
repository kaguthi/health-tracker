import { initiateDonation } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRESET_AMOUNTS = [
  { value: 50, label: "Starter" },
  { value: 100, label: "Supporter" },
  { value: 500, label: "Champion" },
  { value: 1000, label: "Patron" },
];

const GOAL = 500000;
const RAISED = 312000;
const SUPPORTERS = 8240;

export default function DonationScreen() {
  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();

  const displayAmount = customAmount
    ? parseInt(customAmount) || 0
    : selectedAmount;

  const progress = Math.min((RAISED / GOAL) * 100, 100);

  const normalisePhone = (raw: string): string => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("07") && digits.length === 10) {
      return "254" + digits.slice(1);
    }
    if (digits.startsWith("254")) return digits;
    return digits;
  };

  const initiateSTKPush = async () => {
    const normalised = normalisePhone(phone);
    if (!displayAmount || displayAmount < 1) {
      setError("Please enter a valid donation amount.");
      return;
    }
    if (normalised.length < 12) {
      setError("Please enter a valid M-Pesa number (e.g. 0712 345 678).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await initiateDonation(displayAmount, normalised);
      router.push("/(page)/success");
    } catch (e: any) {
      setError("Something went wrong. Please try again.");
      console.error("Donation initiation failed:", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 5 }}
      >
        <View className="bg-green-50 px-7 pt-12 pb-7 items-center">
          <View className="w-14 h-14 bg-green-700 rounded-2xl items-center justify-center mb-3">
            <Ionicons name="heart" size={28} color="#EAF3DE" />
          </View>
          <Text className="text-green-900 text-lg font-medium">
            Support HealthTracker
          </Text>
          <Text className="text-green-700 text-xs mt-1 text-center">
            Pay via M-Pesa · Powered by Safaricom
          </Text>
        </View>

        <View className="px-5 pt-5 pb-8">
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center gap-3 mb-3">
            <View className="w-9 h-9 bg-green-100 rounded-full items-center justify-center">
              <Ionicons name="people-outline" size={16} color="#3B6D11" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-xs font-medium">
                {SUPPORTERS.toLocaleString()} people supported
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5">
                Goal: KSh {GOAL.toLocaleString()} · KSh{" "}
                {RAISED.toLocaleString()} raised
              </Text>
            </View>
          </View>

          <View className="h-1.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
            <View
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>

          <Text className="text-gray-500 text-xs mb-2">Choose amount</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {PRESET_AMOUNTS.map(({ value, label }) => {
              const active = !customAmount && selectedAmount === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    setSelectedAmount(value);
                    setCustomAmount("");
                    setError("");
                  }}
                  className="rounded-xl py-2.5 items-center"
                  style={{
                    minWidth: "45%",
                    flex: 1,
                    borderWidth: active ? 2 : 0.5,
                    borderColor: active ? "#639922" : "#E5E7EB",
                    backgroundColor: active ? "#EAF3DE" : "#F9FAFB",
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: active ? "#173404" : "#111827" }}
                  >
                    KSh {value.toLocaleString()}
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: active ? "#3B6D11" : "#9CA3AF" }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 gap-2 mb-5">
            <Text className="text-gray-400 text-xs">KSh</Text>
            <TextInput
              placeholder="Custom amount"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
              value={customAmount}
              onChangeText={(v) => {
                setCustomAmount(v.replace(/[^0-9]/g, ""));
                setError("");
              }}
              className="flex-1 text-sm text-gray-900"
            />
          </View>

          <Text className="text-gray-500 text-xs mb-1">
            M-Pesa phone number
          </Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 gap-2 mb-1">
            <Ionicons name="phone-portrait-outline" size={16} color="#9CA3AF" />
            <TextInput
              placeholder="0712 345 678"
              placeholderTextColor="#D1D5DB"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                setError("");
              }}
              maxLength={13}
              className="flex-1 text-sm text-gray-900"
            />
          </View>
          <Text className="text-gray-400 text-xs mb-5">
            We'll send an M-Pesa prompt to this number
          </Text>

          <View className="bg-green-50 rounded-xl px-4 py-3 flex-row gap-2 mb-5">
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#3B6D11"
              style={{ marginTop: 1 }}
            />
            <View className="flex-1">
              <Text className="text-green-900 text-xs font-medium">
                How it works
              </Text>
              <Text className="text-green-800 text-xs mt-1 leading-5">
                Tap the button below → check your phone for the M-Pesa prompt →
                enter your PIN to complete the donation.
              </Text>
            </View>
          </View>

          {error ? (
            <Text className="text-red-500 text-xs mb-3">{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={initiateSTKPush}
            disabled={loading}
            className="rounded-xl py-3 items-center mb-3"
            style={{ backgroundColor: loading ? "#97C459" : "#639922" }}
          >
            <Text className="text-sm font-medium" style={{ color: "#EAF3DE" }}>
              {loading
                ? "Connecting to M-Pesa…"
                : `Send KSh ${displayAmount.toLocaleString()} via M-Pesa`}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center gap-1.5">
            <Ionicons name="lock-closed-outline" size={12} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs">
              Secure · Powered by Safaricom M-Pesa
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
