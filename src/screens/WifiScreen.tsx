import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import WifiManager from "react-native-wifi-reborn";

import { colors } from "../theme";
import { scanAndClassifyWifi } from "../services/WifiClassifier";

type ClassifiedWifiNetwork = {
  SSID: string;
  BSSID: string;
  level: number;
  frequency: number;
  capabilities: string;
  vendor: string;
  rsnFlags: string;
  description: string;
  color: string;
  order: number;
};

const getSignalColor = (level: number) => {
  if (level >= -55) return "#4ade80";
  if (level >= -70) return "#facc15";

  return "#f87171";
};

const getStatusColor = (type: string) => {
  switch (type) {
    case "good-wifi":
      return "#4ade80";
    case "nontarget-wifi":
      return "#facc15";
    case "bad-wifi":
      return "#f87171";
    default:
      return "#60a5fa";
  }
};

export default function WifiScreen() {
  const [networks, setNetworks] = useState<ClassifiedWifiNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const scanWifi = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Location permission denied");
        return;
      }

      const rawNetworks = await WifiManager.reScanAndLoadWifiList();

      const classifiedNetworks = await scanAndClassifyWifi(rawNetworks);

      const sorted = classifiedNetworks.sort(
        (a, b) => a.order - b.order || b.level - a.level,
      );

      setNetworks(sorted);
    } catch (e) {
      console.log("Wi-Fi scan error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    scanWifi();
  }, []);

  useFocusEffect(
    useCallback(() => {
      scanWifi(true);

      intervalRef.current = setInterval(() => {
        scanWifi(true);
      }, 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []),
  );

  const renderItem = ({ item }: { item: ClassifiedWifiNetwork }) => {
    const signalColor = getSignalColor(item.level);
    const statusColor = getStatusColor(item.color);

    return (
      <BlurView intensity={45} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Ionicons name="wifi" size={18} color={signalColor} />

              <Text style={styles.ssid} numberOfLines={1}>
                {item.SSID || "Hidden network"}
              </Text>
            </View>

            <Text style={styles.mac}>MAC: {item.BSSID}</Text>
          </View>

          <View style={styles.signalBlock}>
            <Text style={[styles.signal, { color: signalColor }]}>
              {item.level} dBm
            </Text>

            <Text style={styles.frequency}>{item.frequency} MHz</Text>
          </View>
        </View>

        <View style={styles.badges}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${statusColor}22`,
                borderColor: `${statusColor}55`,
              },
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                {
                  backgroundColor: statusColor,
                },
              ]}
            />

            <Text style={[styles.badgeText, { color: statusColor }]}>
              {item.description}
            </Text>
          </View>

          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color="#60a5fa" />

            <Text style={styles.badgeTextNeutral}>
              {item.rsnFlags || "Unknown"}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Производитель</Text>

            <Text style={styles.infoValue}>{item.vendor || "Неизвестно"}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Частота</Text>

            <Text style={styles.infoValue}>{item.frequency} MHz</Text>
          </View>
        </View>
      </BlurView>
    );
  };

  return (
    <LinearGradient
      colors={["#0b1120", "#111827", "#1e293b"]}
      style={styles.container}
    >
      <FlatList
        data={networks}
        keyExtractor={(item, index) => item.BSSID + index}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => scanWifi(true)}
            tintColor="#60a5fa"
          />
        }
        ListHeaderComponent={
          <>
            <BlurView intensity={50} tint="dark" style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
                  <Text style={styles.heroTitle}>Wi-Fi Scanner</Text>

                  <Text style={styles.heroSubtitle}>
                    Автообновление каждые 5 секунд
                  </Text>
                </View>

                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />

                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.heroStats}>
                <View style={styles.statCard}>
                  <Ionicons name="wifi" size={18} color="#60a5fa" />

                  <Text style={styles.statValue}>{networks.length}</Text>

                  <Text style={styles.statLabel}>сетей</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="shield-checkmark" size={18} color="#4ade80" />

                  <Text style={styles.statValue}>
                    {networks.filter((n) => n.color === "good-wifi").length}
                  </Text>

                  <Text style={styles.statLabel}>безопасных</Text>
                </View>

                <View style={styles.statCard}>
                  <Ionicons name="warning" size={18} color="#f87171" />

                  <Text style={styles.statValue}>
                    {networks.filter((n) => n.color === "bad-wifi").length}
                  </Text>

                  <Text style={styles.statLabel}>опасных</Text>
                </View>
              </View>
            </BlurView>

            <Text style={styles.sectionTitle}>Найденные сети</Text>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#3b82f6"
                style={{ marginTop: 40 }}
              />
            )}

            {!loading && !networks.length && (
              <Text style={styles.emptyText}>Wi-Fi сети не найдены</Text>
            )}
          </>
        }
        renderItem={renderItem}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 70,
    paddingBottom: 40,
  },

  heroCard: {
    overflow: "hidden",
    borderRadius: 30,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 28,
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },

  heroSubtitle: {
    color: "#94a3b8",
    fontSize: 14,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.25)",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#4ade80",
  },

  liveText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "700",
  },

  heroStats: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
  },

  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 18,
  },

  card: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  ssid: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    maxWidth: "90%",
  },

  mac: {
    color: "#64748b",
    fontSize: 12,
  },

  signalBlock: {
    alignItems: "flex-end",
  },

  signal: {
    fontSize: 16,
    fontWeight: "700",
  },

  frequency: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  badgeTextNeutral: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
  },

  infoGrid: {
    flexDirection: "row",
    gap: 12,
  },

  infoItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 14,
  },

  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 6,
  },

  infoValue: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});
