import { formatDay, getGreeting } from "@/constants/types";
import { useAuth } from "@/hooks/useAuth";
import { useHealthData } from "@/hooks/useHealthData";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Polyline } from "react-native-svg";

const activities = [
  {
    icon: "walk",
    bg: "#E1F5EE",
    color: "#0F6E56",
    name: "Morning run",
    time: "6:30 AM · 32 min",
    right: "4.2 km",
    sub: "310 kcal",
  },
  {
    icon: "barbell",
    bg: "#EEEDFE",
    color: "#534AB7",
    name: "Weight training",
    time: "Yesterday · 55 min",
    right: "Full body",
    sub: "380 kcal",
  },
] as const;

const DAILY_STEP_GOAL = 12000;
const DAILY_CALORIE_GOAL = 2500;
const AVG_HEART_RATE = 75;
const AVG_SLEEP_HOURS = 8;
const AVG_DISTANCE_KM = 8;

export default function HomeScreen() {
  const { name, isLoading } = useAuth();
  const { steps, activeCalories, heartRate, sleep, distance, error } =
    useHealthData();

  const latestSleep = sleep[sleep.length - 1];
  const sleepHours = latestSleep
    ? Math.round(
        ((new Date(latestSleep.endTime).getTime() -
          new Date(latestSleep.startTime).getTime()) /
          (1000 * 60 * 60)) *
          10,
      ) / 10
    : null;

  const hrPoints =
    heartRate.length > 1
      ? heartRate
          .map((s, i) => {
            const x = (i / (heartRate.length - 1)) * 120;
            const y = 36 - ((s.beatsPerMinute - 40) / 120) * 36;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : "0,18 120,18";

  const latestBpm = heartRate[heartRate.length - 1]?.beatsPerMinute ?? null;
  const bpmDiff =
    latestBpm !== null ? Math.abs(latestBpm - AVG_HEART_RATE) : null;
  const bpmTrend =
    latestBpm !== null && latestBpm < AVG_HEART_RATE ? "below" : "above";

  const goals = [
    {
      icon: "walk-outline",
      label: "Steps",
      value: steps.toLocaleString(),
      sub: `${(DAILY_STEP_GOAL - steps).toLocaleString()} to go`,
      pct: Math.min(100, (steps / DAILY_STEP_GOAL) * 100),
      color: "#1D9E75",
    },
    {
      icon: "flame-outline",
      label: "Calories",
      value: activeCalories.toLocaleString(),
      sub: `${(DAILY_CALORIE_GOAL - activeCalories).toLocaleString()} to go`,
      pct: Math.min(100, (activeCalories / DAILY_CALORIE_GOAL) * 100),
      color: "#EF9F27",
    },
    {
      icon: "walk-sharp",
      label: "Distance",
      value: distance.toLocaleString(),
      sub: `${(AVG_DISTANCE_KM - distance).toLocaleString()} km left`,
      pct: Math.min(100, (distance / AVG_DISTANCE_KM) * 100),
      color: "#378ADD",
    },
    {
      icon: "moon-outline",
      label: "Sleep",
      value: sleepHours !== null ? `${sleepHours} hrs` : "—",
      sub: `Goal: ${AVG_SLEEP_HOURS} hrs`,
      pct:
        sleepHours !== null
          ? Math.min(100, (sleepHours / AVG_SLEEP_HOURS) * 100)
          : 0,
      color: "#7F77DD",
    },
  ] as const;

  if (isLoading) return null;
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 5 }}
      >
        <View className="bg-blue-50 px-5 pt-5 pb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-blue-600 text-xs mb-0.5">
                {formatDay()}
              </Text>
              <Text className="text-blue-900 text-lg font-medium">
                {getGreeting()}, {name?.split(" ")[0] || "Alex"}
              </Text>
            </View>
            <View className="w-9 h-9 rounded-full bg-blue-200 items-center justify-center">
              <Text className="text-blue-900 text-xs font-medium">
                {name?.slice(0, 2).toUpperCase() || "AL"}
              </Text>
            </View>
          </View>

          {error ? (
            <View className="bg-red-100 rounded-lg px-3 py-2 mb-2">
              <Text className="text-red-700 text-xs">{error}</Text>
            </View>
          ) : null}

          <View className="bg-blue-100 rounded-xl px-4 py-3 flex-row justify-between items-center">
            <View>
              <Text className="text-blue-600 text-xs mb-0.5">Daily streak</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-blue-900 text-xl font-medium">
                  12 days
                </Text>
                <Ionicons name="flame" size={16} color="#BA7517" />
              </View>
            </View>
            <View className="items-end">
              <Text className="text-blue-600 text-xs mb-0.5">
                Today's score
              </Text>
              <Text className="text-blue-900 text-xl font-medium">74%</Text>
            </View>
          </View>
        </View>

        <View className="px-4 pt-4">
          <Text className="text-gray-400 text-xs font-medium mb-2.5">
            Today's goals
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {goals.map(({ icon, label, value, sub, pct, color }) => (
              <View
                key={label}
                className="bg-gray-50 rounded-xl p-3"
                style={{ width: "48%" }}
              >
                <View className="flex-row items-center gap-1.5 mb-1.5">
                  <Ionicons name={icon} size={14} color={color} />
                  <Text className="text-gray-400 text-xs">{label}</Text>
                </View>
                <Text className="text-gray-900 text-lg font-medium mb-1.5">
                  {value}
                </Text>
                <View className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </View>
                <Text className="text-gray-400 text-xs mt-1">{sub}</Text>
              </View>
            ))}
          </View>

          <Text className="text-gray-400 text-xs font-medium mb-2.5">
            Heart rate
          </Text>
          <View className="bg-gray-50 rounded-xl p-3 flex-row items-center gap-3 mb-4">
            <View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-gray-900 text-2xl font-medium">
                  {latestBpm ?? "—"}
                </Text>
                <Text className="text-gray-400 text-sm">bpm</Text>
              </View>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Ionicons
                  name={
                    bpmTrend === "below"
                      ? "trending-down-outline"
                      : "trending-up-outline"
                  }
                  size={11}
                  color="#1D9E75"
                />
                <Text className="text-xs" style={{ color: "#1D9E75" }}>
                  {bpmDiff !== null
                    ? `${bpmDiff} ${bpmTrend} avg · Resting`
                    : "No data"}
                </Text>
              </View>
            </View>
            <View className="flex-1 h-9">
              <Svg viewBox="0 0 120 36" width="100%" height="36">
                <Polyline
                  points={hrPoints}
                  fill="none"
                  stroke="#E24B4A"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
          </View>

          <Text className="text-gray-400 text-xs font-medium mb-2.5">
            Recent activity
          </Text>
          <View className="gap-2 mb-6">
            {activities.map(({ icon, bg, color, name, time, right, sub }) => (
              <View
                key={name}
                className="flex-row items-center gap-2.5 p-3 border border-gray-100 rounded-xl"
              >
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <Ionicons
                    name={`${icon}-outline` as any}
                    size={18}
                    color={color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-medium">
                    {name}
                  </Text>
                  <Text className="text-gray-400 text-xs">{time}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-900 text-sm font-medium">
                    {right}
                  </Text>
                  <Text className="text-gray-400 text-xs">{sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
