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
  level: number;
};

export default function WifiScreen() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);

  const scanWifi = async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    try {
      const result = await WifiManager.reScanAndLoadWifiList();
      setNetworks(result);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    scanWifi();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={networks}
        keyExtractor={(item, index) => item.SSID + index}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.ssid}>{item.SSID || "Hidden network"}</Text>
            <Text style={styles.signal}>{item.level} dBm</Text>
          </View>
        )}
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
  ssid: { color: colors.text, fontSize: 16 },
  signal: { color: colors.subtext },
});
