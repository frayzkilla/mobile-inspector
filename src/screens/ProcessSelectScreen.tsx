import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { api, Process } from "../services/api";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ProcessSelect">;

export default function ProcessSelectScreen({ navigation, route }: Props) {
  const { vsp } = route.params;
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const data = await api.getChecklists();
      setProcesses(
        data.filter(
          (p) => p.process_id !== "00000000-0000-0000-0000-000000000000",
        ),
      );
    } catch (error) {
      console.error("Error loading processes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Выберите процесс проверки</Text>

      <FlatList
        data={processes}
        keyExtractor={(item) => item.process_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("Checklist", { vsp, process: item })
            }
          >
            <Text style={styles.shortName}>{item.process_short_name}</Text>
            <Text style={styles.name}>{item.process_name}</Text>
            <Text style={styles.categories}>
              Категорий: {item.categories.length}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  shortName: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  categories: {
    color: "#888",
    fontSize: 12,
  },
});
