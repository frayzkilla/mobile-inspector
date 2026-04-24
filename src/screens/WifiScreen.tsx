import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
} from "react-native";
import WifiManager from "react-native-wifi-reborn";
import { colors } from "../theme";

type WifiNetwork = {
  SSID: string;
  BSSID: string;
  level: number;
  frequency: number;
  linkSpeed?: number;
  capabilities: string;
  manufacturer?: string;
};

// Простейший словарь производителей по префиксу MAC
const MAC_MANUFACTURERS: Record<string, string> = {
  "00:1A:11": "Cisco",
  "00:1B:63": "Apple",
  "3C:5A:B4": "Samsung",
  "FC:FB:FB": "Huawei",
  "00:26:BB": "TP-Link",
  "F4:5C:89": "Xiaomi",
  // добавляй свои по необходимости
};

function getManufacturer(bssid: string) {
  if (!bssid) return "Unknown";
  const prefix = bssid.toUpperCase().slice(0, 8); // первые 3 байта
  return MAC_MANUFACTURERS[prefix] || "Unknown";
}

export default function WifiScreen() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);

  const scanWifi = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Location permission denied");
      return;
    }

    try {
      const result = await WifiManager.reScanAndLoadWifiList();

      const mapped =
        result?.map((net: any) => ({
          SSID: net.SSID,
          BSSID: net.BSSID,
          level: net.level,
          frequency: net.frequency,
          linkSpeed: net.linkSpeed,
          capabilities: net.capabilities,
          manufacturer: getManufacturer(net.BSSID),
        })) ?? [];

      setNetworks(mapped);
    } catch (e) {
      console.log("Wi-Fi scan error:", e);
    }
  };

  useEffect(() => {
    scanWifi();
  }, []);

  const highlightNetwork = (ssid: string) => {
    if (!ssid) return false;
    const lower = ssid.toLowerCase();
    return lower.includes("sber") || lower.includes("sberbank");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={networks}
        keyExtractor={(item, index) => item.BSSID + index}
        renderItem={({ item }) => {
          const isHighlighted = highlightNetwork(item.SSID);
          return (
            <View
              style={[
                styles.row,
                isHighlighted && { backgroundColor: "#FFD700" }, // золотая подсветка
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.ssid}>{item.SSID || "Hidden network"}</Text>
                <Text style={styles.subtext}>MAC: {item.BSSID}</Text>
                <Text style={styles.subtext}>
                  Manufacturer: {item.manufacturer}
                </Text>
                <Text style={styles.subtext}>Freq: {item.frequency} MHz</Text>
                <Text style={styles.subtext}>
                  Link speed: {item.linkSpeed ?? "N/A"} Mbps
                </Text>
                <Text style={styles.subtext}>
                  Security: {item.capabilities}
                </Text>
              </View>
              <Text style={styles.signal}>{item.level} dBm</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  ssid: { color: colors.text, fontSize: 16, fontWeight: "bold" },
  subtext: { color: colors.subtext, fontSize: 12 },
  signal: { color: colors.subtext, fontSize: 16, fontWeight: "bold" },
});
