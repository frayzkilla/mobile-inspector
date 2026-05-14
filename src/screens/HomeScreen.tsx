import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Проверка ВСП</Text>
      <Text style={styles.subtitle}>Выберите действие</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("VspSelect")}
      >
        <Text style={styles.buttonText}>Начать проверку</Text>
        <Text style={styles.buttonDesc}>Выбрать ВСП и процесс проверки</Text>
      </TouchableOpacity>

      {Platform.OS === "android" && (
        <TouchableOpacity
          style={[styles.button, styles.wifiButton]}
          onPress={() => navigation.navigate("Wifi")}
        >
          <Text style={styles.buttonText}>Анализ Wi-Fi</Text>
          <Text style={styles.buttonDesc}>Проверка беспроводных сетей</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  wifiButton: {
    backgroundColor: "#1a2a3a",
  },
  buttonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonDesc: {
    color: "#888",
    fontSize: 14,
  },
});
