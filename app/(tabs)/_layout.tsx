import colors from "@/theme/colors";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarHideOnKeyboard: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <AntDesign name="home" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <Ionicons name="search-sharp" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="chat-topics"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="test-screen"
        options={{
          title: "Test",
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="test-tube" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}