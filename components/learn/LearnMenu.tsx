import colors from "@/theme/colors";
import type { Brick } from "@/types/brick";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  brick: Brick | null;
  reportBrokenFile: () => void;
};

export function LearnMenu({
  menuOpen,
  setMenuOpen,
  brick,
  reportBrokenFile,
}: Props) {
  const router = useRouter();

  return (
    <>
      <Pressable
        style={styles.menuButton}
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <AntDesign
          name={menuOpen ? "close" : "menu"}
          size={24}
          color={colors.primary}
        />
      </Pressable>

      {menuOpen && (
        <View style={styles.menu}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              router.push({
                pathname: "/edit-brick",
                params: { brick_id: brick?.id },
              });
            }}
          >
            <Text>Edit brick</Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              router.push({ pathname: "/help" });
            }}
          >
            <Text>Help</Text>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              setMenuOpen(false);
              reportBrokenFile();
            }}
          >
            <Text>Report issue</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 8,
  },
  menu: {
    position: "absolute",
    top: 80,
    left: 20,
    backgroundColor: "white",
    borderRadius: 6,
    paddingVertical: 8,
    minWidth: 120,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
