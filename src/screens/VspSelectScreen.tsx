import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { api, Vsp } from "../services/api";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "VspSelect">;

export default function VspSelectScreen({ navigation }: Props) {
  const [vsps, setVsps] = useState<Vsp[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadVsps();
  }, []);

  const loadVsps = async () => {
    try {
      const data = await api.getVsps();
      setVsps(data);
    } catch (error) {
      console.error("Error loading VSPs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vsps.filter(
    (vsp) =>
      vsp.vsp_name.toLowerCase().includes(query.toLowerCase()) ||
      vsp.vsp_address.toLowerCase().includes(query.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Поиск ВСП"
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.vsp_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ProcessSelect", { vsp: item })}
          >
            <Text style={styles.title}>{item.vsp_name}</Text>
            <Text style={styles.address}>{item.vsp_address}</Text>
            <Text style={styles.timetable}>{item.vsp_timetable}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { justifyContent: "center", alignItems: "center" },
  search: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  address: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 4,
  },
  timetable: {
    color: "#888",
    fontSize: 12,
  },
});
