import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
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
import { api, Process } from "../services/api";

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
      <LinearGradient
        colors={["#0b1120", "#111827", "#1e293b"]}
        style={[styles.container, styles.center]}
      >
        <BlurView intensity={50} tint="dark" style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#3b82f6" />

          <Text style={styles.loadingText}>Загрузка процессов...</Text>
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
        data={processes}
        keyExtractor={(item) => item.process_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.headerBlock}>
              <Text style={styles.subtitle}>{vsp.vsp_name}</Text>

              <View style={styles.vspBadge}>
                <Ionicons name="location-outline" size={14} color="#cbd5e1" />

                <Text style={styles.vspBadgeText}>{vsp.vsp_address}</Text>
              </View>
            </View>

            {!processes.length && (
              <BlurView intensity={40} tint="dark" style={styles.emptyCard}>
                <Ionicons
                  name="document-text-outline"
                  size={42}
                  color="#94a3b8"
                />

                <Text style={styles.emptyTitle}>Процессы не найдены</Text>

                <Text style={styles.emptySubtitle}>
                  Для данного ВСП пока нет доступных процессов проверки
                </Text>
              </BlurView>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("Checklist", {
                vsp,
                process: item,
              })
            }
          >
            <BlurView intensity={45} tint="dark" style={styles.card}>
              {/* <View style={styles.cardGlow} /> */}

              <View style={styles.cardTop}>
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.shortName}>
                    {item.process_short_name}
                  </Text>

                  <Text style={styles.name}>{item.process_name}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#64748b" />
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.categoryBadge}>
                  <Ionicons name="layers-outline" size={14} color="#cbd5e1" />

                  <Text style={styles.categoryText}>
                    Категорий: {item.categories.length}
                  </Text>
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
    marginBottom: 28,
  },

  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 8,
  },

  subtitle: {
    color: "#60a5fa",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },

  vspBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  vspBadgeText: {
    color: "#cbd5e1",
    fontSize: 13,
    marginLeft: 6,
    maxWidth: 280,
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

  indexBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(59,130,246,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  indexText: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "700",
  },

  shortName: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  name: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    paddingRight: 14,
  },

  bottomRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  categoryText: {
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
    lineHeight: 20,
  },
});
