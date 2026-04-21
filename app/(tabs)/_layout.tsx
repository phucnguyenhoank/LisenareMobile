import colors from "@/theme/colors";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: 60 + insets.bottom, //  height of bar + system navigation bar
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
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
            <View
              style={{
                flexDirection: "row",
                marginRight: 15,
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => router.push("/test-ui")}
                style={{ marginRight: 20 }}
              >
                <MaterialCommunityIcons
                  name="test-tube"
                  size={24}
                  color="black"
                />
              </Pressable>

              {/* "Add snippet" Button */}
              <Pressable
                onPress={() => router.push("/add-snippet")}
                style={{ marginRight: 20 }} // Space between the two buttons
              >
                <MaterialIcons name="post-add" size={26} color="black" />
              </Pressable>

              {/* Search Button */}
              <Pressable onPress={() => router.push("/search")}>
                <Ionicons name="search-sharp" size={24} color="black" />
              </Pressable>
            </View>
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
