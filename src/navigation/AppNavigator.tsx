import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types/navigation";

import HomeScreen from "../screens/HomeScreen";
import VspSelectScreen from "../screens/VspSelectScreen";
import ProcessSelectScreen from "../screens/ProcessSelectScreen";
import ChecklistScreen from "../screens/ChecklistScreen";
import WifiScreen from "../screens/WifiScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function GlassHeaderTitle({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.headerTitleContainer}>
      <View style={styles.headerIcon}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>

      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true,

        headerTintColor: "#fff",

        animation: Platform.OS === "ios" ? "none" : "fade",

        contentStyle: {
          backgroundColor: "#0b1120",
        },

        headerBackground: () => (
          <BlurView
            intensity={55}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),

        headerShadowVisible: false,

        headerTitleAlign: "center",

        headerTitleStyle: {
          fontWeight: "700",
          color: "#fff",
          fontSize: 18,
        },

        headerStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="VspSelect"
        component={VspSelectScreen}
        options={{
          headerTitle: () => (
            <GlassHeaderTitle title="Выбор ВСП" icon="business-outline" />
          ),
        }}
      />

      <Stack.Screen
        name="ProcessSelect"
        component={ProcessSelectScreen}
        options={{
          headerTitle: () => (
            <GlassHeaderTitle
              title="Выбор процесса"
              icon="git-network-outline"
            />
          ),
        }}
      />

      <Stack.Screen
        name="Checklist"
        component={ChecklistScreen}
        options={{
          headerTitle: () => (
            <GlassHeaderTitle title="Чек-лист" icon="checkmark-done-outline" />
          ),
        }}
      />

      <Stack.Screen
        name="Wifi"
        component={WifiScreen}
        options={{
          headerTitle: () => (
            <GlassHeaderTitle title="Анализ Wi-Fi" icon="wifi-outline" />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },

  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(59,130,246,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
