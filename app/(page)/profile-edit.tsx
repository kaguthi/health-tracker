import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileEdit() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text className="text-blue-900 text-lg font-medium">
        Edit profile coming soon...
      </Text>
      <TouchableOpacity
        className="mt-4 px-4 py-2 bg-blue-500 rounded"
        onPress={() => router.back()}
      >
        <Text className="text-white">Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
