import React, { useState } from "react";
import { View, TextInput, FlatList, StyleSheet, Text } from "react-native";
import { checklists } from "../data/checklists";
import GroupBlock from "../components/GroupBlock";
import { colors } from "../theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Inspection">;

export default function InspectionScreen({ route }: Props) {
  const { ticket } = route.params;

  const checklist = checklists.find((c) => c.id === ticket.checklist_id);

  const [query, setQuery] = useState("");

  if (!checklist) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "white" }}>Checklist not found</Text>
      </View>
    );
  }

  const groups = checklist.groups.map((g) => ({
    ...g,
    violations: g.violations.filter((v) =>
      v.name.toLowerCase().includes(query.toLowerCase()),
    ),
  }));

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Поиск нарушения"
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={groups}
        keyExtractor={(g) => g.group}
        renderItem={({ item }) => <GroupBlock group={item} />}
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
