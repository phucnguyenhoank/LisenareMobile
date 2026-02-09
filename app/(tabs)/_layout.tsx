import colors from "@/theme/colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/profile")}
              style={{ marginRight: 15 }}
            >
              <Feather name="settings" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="practice-bricks"
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
              <Feather name="settings" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="learner-statistic"
        options={{
          title: "Trạng thái",
          tabBarIcon: ({ color }) => (
            <AntDesign name="line-chart" size={24} color={color} />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/profile")}
              style={{ marginRight: 15 }}
            >
              <Feather name="settings" size={24} color="black" />
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
