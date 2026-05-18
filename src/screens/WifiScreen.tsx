import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import WifiManager from "react-native-wifi-reborn";
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

type FilterType = "all" | "good-wifi" | "nontarget-wifi" | "bad-wifi";

const FILTER_CATEGORIES: {
  key: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "bad-wifi", label: "Опасные", icon: "warning" },
  { key: "nontarget-wifi", label: "Подозрительные", icon: "eye" },
  { key: "good-wifi", label: "Доверенные", icon: "shield-checkmark" },
  { key: "all", label: "Все", icon: "apps" },
];

const CATEGORY_PRIORITY: Record<FilterType, number> = {
  "bad-wifi": 0,
  "nontarget-wifi": 1,
  "good-wifi": 2,
  all: 3,
};

const riskPriority = (color: string, order: number): number => {
  if (order >= 50) return 0;
  if (order >= 7) return 1;
  if (order >= 5) return 2;
  if (color === "good-wifi") return 3;
  return 4;
};

const getRiskColor = (color: string): string => {
  switch (color) {
    case "bad-wifi":
      return "#FB7185";
    case "nontarget-wifi":
      return "#FBBF24";
    case "good-wifi":
      return "#34D399";
    default:
      return "#94A3B8";
  }
};

const estimateDistance = (level: number, frequency: number): string => {
  const exp =
    (27.55 - 20 * Math.log10(frequency || 2412) + Math.abs(level)) / 20;
  const distance = Math.pow(10, exp);
  if (distance < 1) return "<1м";
  if (distance < 10) return `${distance.toFixed(1)}м`;
  return `${Math.round(distance)}м`;
};

const requestPermission = async (): Promise<boolean> => {
  if (Platform.OS === "ios") return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

const SCAN_INTERVAL = 5000;
const SCAN_COOLDOWN = 2500;

export default function WifiScreen() {
  const [networks, setNetworks] = useState<ClassifiedWifiNetwork[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [isScanning, setIsScanning] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScanRef = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  const scanWifi = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (now - lastScanRef.current < SCAN_COOLDOWN) return;

    lastScanRef.current = now;
    if (!mountedRef.current) return;
    setIsScanning(true);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      if (Platform.OS === "android") {
        await WifiManager.forceWifiUsage(true);
      }

      const result = await WifiManager.reScanAndLoadWifiList();
      let raw: any[] = [];

      if (typeof result === "string") {
        try {
          raw = JSON.parse(result);
        } catch {
          raw = [];
        }
      } else if (Array.isArray(result)) {
        raw = result;
      } else if (result && typeof result === "object") {
        raw = Object.values(result);
      }

      const valid = raw.filter(
        (item: any) => item && typeof item === "object" && item.BSSID,
      );

      if (valid.length > 0 && mountedRef.current) {
        const classified = await scanAndClassifyWifi(valid);
        const seen = new Set<string>();
        const unique = classified.filter((n) => {
          if (seen.has(n.BSSID)) return false;
          seen.add(n.BSSID);
          return true;
        });

        const sorted = unique.sort((a, b) => {
          const pa = riskPriority(a.color, a.order);
          const pb = riskPriority(b.color, b.order);
          if (pa !== pb) return pa - pb;
          if (a.order !== b.order) return b.order - a.order;
          return b.level - a.level;
        });

        setNetworks(sorted);
      }
    } catch (error) {
      console.error("WiFi scan error:", error);
    } finally {
      if (mountedRef.current) setIsScanning(false);
    }
  }, []);

  const startScanning = useCallback((): void => {
    scanWifi();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      scanWifi();
    }, SCAN_INTERVAL);
  }, [scanWifi]);

  const stopScanning = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const handleAppState = (nextState: AppStateStatus): void => {
      if (nextState === "active") {
        startScanning();
      } else {
        stopScanning();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      mountedRef.current = false;
      stopScanning();
      subscription.remove();
    };
  }, [startScanning, stopScanning]);

  useFocusEffect(
    useCallback(() => {
      startScanning();
      return () => stopScanning();
    }, [startScanning, stopScanning]),
  );

  const counts = useMemo(() => {
    const countMap: Record<FilterType, number> = {
      all: networks.length,
      "bad-wifi": 0,
      "nontarget-wifi": 0,
      "good-wifi": 0,
    };
    for (const n of networks) {
      if (countMap[n.color as FilterType] !== undefined) {
        countMap[n.color as FilterType]++;
      }
    }
    return countMap;
  }, [networks]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return networks;
    return networks.filter((n) => n.color === activeFilter);
  }, [networks, activeFilter]);

  const renderItem = useCallback(
    ({ item }: { item: ClassifiedWifiNetwork }) => {
      const accent = getRiskColor(item.color);
      const distance = estimateDistance(item.level, item.frequency);

      return (
        <View style={styles.card}>
          <View style={[styles.cardAccent, { backgroundColor: accent }]} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text numberOfLines={1} style={styles.ssid}>
                  {item.SSID || "Скрытая сеть"}
                </Text>
                <Text numberOfLines={1} style={styles.bssid}>
                  {item.BSSID?.toUpperCase()}
                </Text>
              </View>
              <View
                style={[
                  styles.pill,
                  {
                    backgroundColor: `${accent}18`,
                    borderColor: `${accent}30`,
                  },
                ]}
              >
                <Text
                  style={[styles.pillText, { color: accent }]}
                  numberOfLines={1}
                >
                  {item.description}
                </Text>
              </View>
            </View>

            <Text numberOfLines={1} style={styles.vendor}>
              {item.vendor || "Unknown"}
            </Text>

            <View style={styles.metrics}>
              <View style={styles.metricItem}>
                <Ionicons name="wifi" size={10} color="#64748B" />
                <Text style={styles.metricValue}>{item.level} dBm</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Ionicons name="navigate" size={10} color="#64748B" />
                <Text style={styles.metricValue}>{distance}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Ionicons name="lock-closed" size={10} color="#64748B" />
                <Text style={styles.metricValue} numberOfLines={1}>
                  {item.rsnFlags || "OPEN"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback(
    (item: ClassifiedWifiNetwork, index: number) => `${item.BSSID}-${index}`,
    [],
  );

  return (
    <LinearGradient
      colors={["#0A0F1E", "#111827", "#0F172A"]}
      style={styles.screen}
    >
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={15}
        ListHeaderComponent={
          <View style={styles.header}>
            {FILTER_CATEGORIES.sort(
              (a, b) => CATEGORY_PRIORITY[a.key] - CATEGORY_PRIORITY[b.key],
            ).map((cat) => {
              const isActive = activeFilter === cat.key;
              const catColor = getRiskColor(cat.key);

              return (
                <TouchableOpacity
                  key={cat.key}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(cat.key)}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: `${catColor}14`,
                      borderColor: `${catColor}40`,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={12}
                    color={isActive ? catColor : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.filterLabel,
                      isActive && { color: catColor },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  <View
                    style={[
                      styles.filterCount,
                      isActive && { backgroundColor: `${catColor}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        isActive && { color: catColor },
                      ]}
                    >
                      {counts[cat.key]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {isScanning && (
              <View style={styles.scanIndicator}>
                <View style={styles.scanDot} />
                <Text style={styles.scanText}>Сканирование...</Text>
              </View>
            )}
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingTop: 120,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
    alignItems: "center",
  },
  filterChip: {
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  filterLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  filterCount: {
    minWidth: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 4,
  },
  filterCountText: {
    color: "#CBD5E1",
    fontSize: 9,
    fontWeight: "800",
  },
  scanIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    paddingHorizontal: 6,
  },
  scanDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#60A5FA",
  },
  scanText: {
    color: "#60A5FA",
    fontSize: 9,
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  cardAccent: {
    width: 1,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  ssid: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  bssid: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    letterSpacing: 0.4,
    marginTop: 1,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    maxWidth: 100,
  },
  pillText: {
    fontSize: 8,
    fontWeight: "800",
    textAlign: "center",
  },
  vendor: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 6,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.015)",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  metricValue: {
    color: "#CBD5E1",
    fontSize: 9,
    fontWeight: "600",
  },
});
