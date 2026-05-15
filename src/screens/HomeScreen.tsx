import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type TabType = "checks" | "wifi" | "tickets" | "help" | null;

type Answer = {
  check_item_id: string;
  result: boolean;
  comment: string;
  photos: string[];
};

type CheckResult = {
  id: string;
  vspId: string;
  processId: string;
  answers: Answer[];
  createdAt: string;
};

const API_URL = "http://158.160.228.123:8777";

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/results`);
      const data = await response.json();

      setResults(data || []);
    } catch (e) {
      console.log("Ошибка загрузки проверок", e);

      Alert.alert("Ошибка", "Не удалось загрузить список проверок");
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);

    switch (tab) {
      case "checks":
        navigation.navigate("VspSelect");
        break;

      case "wifi":
        if (Platform.OS === "android") {
          navigation.navigate("Wifi");
        } else {
          Alert.alert(
            "Недоступно",
            "К сожалению, iOS не поддерживает анализ Wi-Fi сетей.\n\nФункция доступна только на Android.",
          );
        }
        break;

      case "tickets":
        Alert.alert("Тикеты", "Данный функционал находится в разработке 🚧");
        break;

      case "help":
        Alert.alert("Справка", "Мотошкин Артем :)");
        break;
    }
  };

  const renderItem = ({ item }: { item: CheckResult }) => {
    const validAnswers = item.answers.filter(
      (answer) => answer.result === false,
    );

    if (!validAnswers.length) {
      return null;
    }

    return (
      <BlurView intensity={40} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              Проверка #{item.id.slice(0, 8)}
            </Text>

            <Text style={styles.cardDate}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {validAnswers.map((answer, index) => (
          <View key={index} style={styles.answerBlock}>
            <Text style={styles.answerComment}>
              {answer.comment || "Комментарий отсутствует"}
            </Text>

            {!!answer.photos?.length && (
              <FlatList
                horizontal
                data={answer.photos}
                keyExtractor={(photo) => photo}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingTop: 10,
                }}
                renderItem={({ item: photo }) => (
                  <Image
                    source={{
                      uri: `${API_URL}/images/${photo}`,
                    }}
                    style={styles.photo}
                  />
                )}
              />
            )}
          </View>
        ))}
      </BlurView>
    );
  };

  return (
    <LinearGradient
      colors={["#0b1120", "#111827", "#1e293b"]}
      style={styles.container}
    >
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>

            <BlurView intensity={50} tint="dark" style={styles.heroCard}>
              {/* <View style={styles.heroGlow} /> */}

              <Text style={styles.heroTitle}>Готовы найти все нарушения?</Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.mainButton}
                onPress={() => navigation.navigate("VspSelect")}
              >
                <LinearGradient
                  colors={["#3b83f63a", "#2564eb69"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.mainButtonGradient}
                >
                  <Ionicons name="play-circle-outline" size={22} color="#fff" />

                  <Text style={styles.mainButtonText}>Начать проверку</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#3b82f6"
                style={{ marginTop: 30 }}
              />
            )}

            {!loading && !results.length && (
              <Text style={styles.emptyText}>Проверок пока нет</Text>
            )}
          </>
        }
        renderItem={renderItem}
      />

      <BlurView intensity={55} tint="dark" style={styles.bottomBar}>
        <BottomItem
          icon="checkmark-circle"
          label="Проверки"
          active={activeTab === "checks"}
          onPress={() => handleTabPress("checks")}
        />

        <BottomItem
          icon="wifi"
          label="Wi-Fi"
          active={activeTab === "wifi"}
          onPress={() => handleTabPress("wifi")}
        />

        <BottomItem
          icon="document-text"
          label="Тикеты"
          active={activeTab === "tickets"}
          onPress={() => handleTabPress("tickets")}
        />

        <BottomItem
          icon="help-circle"
          label="Справка"
          active={activeTab === "help"}
          onPress={() => handleTabPress("help")}
        />
      </BlurView>
    </LinearGradient>
  );
}

type BottomItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
};

function BottomItem({ icon, label, active, onPress }: BottomItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.navItem}
      onPress={onPress}
    >
      <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
        <Ionicons name={icon} size={22} color={active ? "#fff" : "#94a3b8"} />
      </View>

      <Text style={[styles.navLabel, active && styles.navLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 70,
    paddingBottom: 130,
  },

  logo: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 22,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  heroCard: {
    overflow: "hidden",
    borderRadius: 30,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 26,
  },

  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(59, 131, 246, 0)",
    top: -80,
    right: -50,
  },

  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
  },

  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },

  mainButton: {
    borderRadius: 18,
    overflow: "hidden",
  },

  mainButtonGradient: {
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  mainButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  card: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    marginBottom: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(74,222,128,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  cardDate: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },

  answerBlock: {
    marginTop: 10,
  },

  answerComment: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 20,
  },

  photo: {
    width: 110,
    height: 110,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: "#1e293b",
  },

  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 30,
    fontSize: 15,
  },

  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 24,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  iconWrapperActive: {
    backgroundColor: "rgba(59,130,246,0.35)",
  },

  navLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },

  navLabelActive: {
    color: "#fff",
  },
});
