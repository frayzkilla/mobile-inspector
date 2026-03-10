import React, { useState } from "react";
import { View, FlatList, TextInput, StyleSheet } from "react-native";
import TicketRow from "../components/TicketRow";
import { tickets } from "../data/tickets";
import { colors } from "../theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Platform, Button } from "react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState("");

  const filtered = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.adress.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Поиск"
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      {Platform.OS === "android" && (
        <Button
          title="Анализ Wi-Fi"
          onPress={() => navigation.navigate("Wifi")}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TicketRow
            ticket={item}
            onPress={() => navigation.navigate("Inspection", { ticket: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  search: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
});
