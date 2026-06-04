import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function success() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1 items-center justify-center px-5">
        <Text className="text-green-600 text-lg font-bold">
          Donation Successful!
        </Text>
        <Text className="text-gray-600 text-center mt-2">
          Thank you for your support!
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default success;
