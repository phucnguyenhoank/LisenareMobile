import colors from "@/theme/colors";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href } from "expo-router";

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
              {[
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
                },
                {
                  name: "search-sharp",
                  lib: Ionicons,
                  route: "/search" as Href,
                  size: 24,
                },
              ].map((item, index) => {
                const IconLib = item.lib;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => router.push(item.route)}
                    // hitSlop adds 16px of "invisible" touch area around the icon
                    hitSlop={16}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.3 : 1,
                        marginLeft: index === 0 ? 0 : 22, // Space between buttons
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
