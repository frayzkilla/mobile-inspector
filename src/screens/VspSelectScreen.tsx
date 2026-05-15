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
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types/navigation";
import { api, Vsp } from "../services/api";

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
      <LinearGradient
        colors={["#0b1120", "#111827", "#1e293b"]}
        style={[styles.container, styles.center]}
      >
        <BlurView intensity={50} tint="dark" style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#3b82f6" />

          <Text style={styles.loadingText}>Загрузка ВСП...</Text>
        </BlurView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0b1120", "#111827", "#1e293b"]}
      style={styles.container}
    >
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.vsp_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.headerBlock}>
              <Text style={styles.subtitle}>Выберите объект банка</Text>
            </View>

            <BlurView intensity={45} tint="dark" style={styles.searchContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#94a3b8"
                style={styles.searchIcon}
              />

              <TextInput
                style={styles.search}
                placeholder="Поиск ВСП..."
                placeholderTextColor="#64748b"
                value={query}
                onChangeText={setQuery}
              />
            </BlurView>

            {!filtered.length && (
              <BlurView intensity={40} tint="dark" style={styles.emptyCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={42}
                  color="#94a3b8"
                />

                <Text style={styles.emptyTitle}>Ничего не найдено</Text>

                <Text style={styles.emptySubtitle}>
                  Попробуйте изменить поисковый запрос
                </Text>
              </BlurView>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("ProcessSelect", {
                vsp: item,
              })
            }
          >
            <BlurView intensity={45} tint="dark" style={styles.card}>
              {/* <View style={styles.cardGlow} /> */}

              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="business-outline" size={22} color="#60a5fa" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.vsp_name}</Text>

                  <Text style={styles.cardAddress}>{item.vsp_address}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color="#cbd5e1" />

                  <Text style={styles.timeText}>{item.vsp_timetable}</Text>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 120,
    paddingBottom: 30,
  },

  headerBlock: {
    marginBottom: 24,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 15,
    lineHeight: 22,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    paddingHorizontal: 18,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  searchIcon: {
    marginRight: 10,
  },

  search: {
    flex: 1,
    color: "#fff",
    height: 56,
    fontSize: 16,
  },

  card: {
    borderRadius: 28,
    overflow: "hidden",
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  cardGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.18)",
    top: -80,
    right: -40,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(59,130,246,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    paddingRight: 12,
  },

  cardAddress: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },

  bottomRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  timeText: {
    color: "#cbd5e1",
    fontSize: 13,
    marginLeft: 6,
  },

  loaderCard: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 26,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  loadingText: {
    color: "#cbd5e1",
    marginTop: 16,
    fontSize: 15,
  },

  emptyCard: {
    marginTop: 10,
    padding: 28,
    borderRadius: 28,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 14,
  },

  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
