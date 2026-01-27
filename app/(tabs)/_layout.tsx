import colors from "@/theme/colors";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ngữ pháp",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="alphabetical"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Thực hành",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="running" size={24} color={color} />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/profile")}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="person" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="test-screen"
        options={{
          title: "Test",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="test-tube" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
