import { request } from "@/api/client";
import type { Collection } from "@/types/collection";
import { useQuery } from "@tanstack/react-query";
import { FlatList, StyleSheet, Text, View } from "react-native";

type ItemProps = { title: string };

const Item = ({ title }: ItemProps) => (
  <View style={styles.item}>
    <Text>{title}</Text>
  </View>
);

export default function DiscoveryScreen() {
  const { data, isPending, error } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: () => request<Collection[]>("/collections"),
  });

  if (isPending) return <Text>Loading...</Text>;
  if (error) return <Text>{"An error has occurred: " + error.message}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Item title={item.name} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
