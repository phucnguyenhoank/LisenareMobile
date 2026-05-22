import colors from "@/theme/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();

  const exploreHeaderButtons = useMemo(
    () => [
      {
        name: "test-tube",
        lib: MaterialCommunityIcons,
        route: "/test-ui" as Href,
        size: 24,
      },
      {
        name: "post-add",
        lib: MaterialIcons,
        route: "/add-snippet" as Href,
        size: 28,
        requiresAuth: true,
      },
      {
        name: "search-sharp",
        lib: Ionicons,
        route: "/search" as Href,
        size: 24,
      },
    ],
    [],
  );
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
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <AntDesign name="compass" size={24} color={color} />
          ),
          headerRight: () => {
            const visibleButtons = exploreHeaderButtons.filter(
              (item) => !item.requiresAuth || token,
            );

            return (
              <View
                style={{
                  flexDirection: "row",
                  marginRight: 15,
                  alignItems: "center",
                }}
              >
                {visibleButtons.map((item, index) => {
                  const IconLib = item.lib;

                  return (
                    <Pressable
                      key={item.name}
                      onPress={() => router.push(item.route)}
                      hitSlop={16}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.3 : 1,
                          marginLeft: index === 0 ? 0 : 22,
                          padding: 4,
                        },
                      ]}
                    >
                      <IconLib
                        name={item.name as any}
                        size={item.size}
                        color="black"
                      />
                    </Pressable>
                  );
                })}
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="pending-bricks"
        options={{
          title: "Practice",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="fitness-center" size={24} color={color} />
          ),
          headerRight: () =>
            token && (
              <Pressable
                onPress={() => router.push("/collection-management")}
                style={{ marginRight: 15 }}
              >
                <MaterialCommunityIcons
                  name="playlist-edit"
                  size={40}
                  color="black"
                />
              </Pressable>
            ),
        }}
      />

      <Tabs.Screen
        name="learner-statistic"
        options={{
          title: "Progress",
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
          title: "Grammar",
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
