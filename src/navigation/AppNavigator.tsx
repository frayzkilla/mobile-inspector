import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import HomeScreen from "../screens/HomeScreen";
import VspSelectScreen from "../screens/VspSelectScreen";
import ProcessSelectScreen from "../screens/ProcessSelectScreen";
import ChecklistScreen from "../screens/ChecklistScreen";
import WifiScreen from "../screens/WifiScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1a1a1a" },
        headerTintColor: "#fff",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Главная" }}
      />
      <Stack.Screen
        name="VspSelect"
        component={VspSelectScreen}
        options={{ title: "Выбор ВСП" }}
      />
      <Stack.Screen
        name="ProcessSelect"
        component={ProcessSelectScreen}
        options={{ title: "Выбор процесса" }}
      />
      <Stack.Screen
        name="Checklist"
        component={ChecklistScreen}
        options={{ title: "Чек-лист" }}
      />
      <Stack.Screen
        name="Wifi"
        component={WifiScreen}
        options={{ title: "Анализ Wi-Fi" }}
      />
    </Stack.Navigator>
  );
}
