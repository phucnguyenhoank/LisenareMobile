import colors from "@/theme/colors";
import { Entypo, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
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
          title: "Khám phá",
          tabBarIcon: ({ color }) => (
            <AntDesign name="compass" size={24} color={color} />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/search")}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="search-sharp" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="pending-collections"
        options={{
          title: "Thực hành",
          tabBarIcon: ({ color }) => (
            <Entypo name="pencil" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="learner-statistic"
        options={{
          title: "Tiến độ",
          tabBarIcon: ({ color }) => (
            <AntDesign name="line-chart" size={24} color={color} />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/setting")}
              style={{ marginRight: 15 }}
            >
              <Feather name="settings" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="grammar-learning"
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
    </Tabs>
  );
}
