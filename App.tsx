import React from "react";
import "react-native-get-random-values";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import InspectionScreen from "./src/screens/InspectionScreen";
import WifiScreen from "./src/screens/WifiScreen";

import { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#111" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "OKB Inspector" }}
        />

        <Stack.Screen
          name="Wifi"
          component={WifiScreen}
          options={{ title: "Wi-Fi анализ" }}
        />

        <Stack.Screen
          name="Inspection"
          component={InspectionScreen}
          options={{ title: "Проверка" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
