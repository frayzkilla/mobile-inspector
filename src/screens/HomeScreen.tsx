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
  Modal,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

type TabType = "checks" | "wifi" | "tickets" | "help" | null;

type VspInfo = {
  id: string;
  name: string;
  address: string;
};

type ProcessInfo = {
  id: string;
  name: string;
};

type CheckItemInfo = {
  id: string;
  name: string;
};

type LocationInfo = {
  latitude: number | null;
  longitude: number | null;
};

type Answer = {
  category: string;
  check_item: CheckItemInfo;
  result: boolean;
  comment: string;
  photos: string[];
  location?: LocationInfo;
  createdAt?: string;
};

type CheckResult = {
  id: string;
  vsp: VspInfo;
  process: ProcessInfo;
  answers: Answer[];
  createdAt: string;
  updatedAt: string | null;
};

const DEV_API_URL = "http://158.160.228.123:8777";
const API_URL = "https://tvldw-nscan0004.delta.sbrf.ru/mobile-backend/api/v1/"

export default function HomeScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheck, setSelectedCheck] = useState<CheckResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_URL}/checks/results`);
      const data = await response.json();

      setResults(data || []);
    } catch (e) {
      console.log("Ошибка загрузки проверок", e);

      Alert.alert("Ошибка", "Не удалось загрузить список проверок");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    await loadResults(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Удаление проверки",
      "Вы уверены, что хотите удалить эту проверку?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${API_URL}/checks/${id}`, { method: "DELETE" });
              setResults((prev) => prev.filter((item) => item.id !== id));
            } catch (e) {
              Alert.alert("Ошибка", "Не удалось удалить проверку");
            }
          },
        },
      ],
    );
  };

  const handleEdit = (item: CheckResult) => {
    Alert.alert("Редактирование", "Функционал редактирования в разработке");
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
        Alert.alert("Тикеты", "Данный функционал находится в разработке");
        break;
      case "help":
        Alert.alert("Справка", "Мотошкин Артем :)");
        break;
    }
  };

  const openDetailModal = (item: CheckResult) => {
    setSelectedCheck(item);
  };

  const closeDetailModal = () => {
    setSelectedCheck(null);
  };

  const renderItem = ({ item }: { item: CheckResult }) => {
    const violationAnswers = item.answers.filter(
      (answer) => answer.result === false,
    );

    if (!violationAnswers.length) {
      return null;
    }

    const allPhotos = violationAnswers.flatMap((ans) =>
      ans.photos.map((photo) => ({
        uri: `${API_URL}/images/${photo}`,
        category: ans.category,
        itemName: ans.check_item.name,
      })),
    );

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openDetailModal(item)}
      >
        <BlurView intensity={40} tint="dark" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.vsp.name}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {item.process.name}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={20} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#60a5fa" />
              <Text style={styles.statText}>
                {violationAnswers.length} найдено
              </Text>
            </View>
          </View>

          {allPhotos.length > 0 && (
            <FlatList
              horizontal
              data={allPhotos}
              keyExtractor={(photo, index) => `${photo.uri}-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
              renderItem={({ item: photo }) => (
                <Image source={{ uri: photo.uri }} style={styles.photo} />
              )}
            />
          )}

          <View style={styles.tapHint}>
            <Ionicons name="eye-outline" size={14} color="#64748b" />
            <Text style={styles.tapHintText}>Нажмите для деталей</Text>
          </View>
        </BlurView>
      </TouchableOpacity>
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
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <>
            <BlurView intensity={50} tint="dark" style={styles.heroCard}>
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

            <Text style={styles.sectionTitle}>Мои проведенные проверки</Text>

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

      <Modal visible={!!selectedCheck} animationType="slide" transparent={true}>
        <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Детали проверки</Text>
              <TouchableOpacity onPress={closeDetailModal}>
                <Ionicons name="close-circle" size={32} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {selectedCheck && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Объект</Text>
                  <Text style={styles.detailValue}>
                    {selectedCheck.vsp.name}
                  </Text>
                  <Text style={styles.detailAddress}>
                    {selectedCheck.vsp.address}
                  </Text>

                  <Text style={[styles.detailLabel, { marginTop: 15 }]}>
                    Процесс
                  </Text>
                  <Text style={styles.detailValue}>
                    {selectedCheck.process.name}
                  </Text>
                </View>

                <Text style={styles.sectionTitle}>Найденные нарушения</Text>

                {selectedCheck.answers
                  .filter((a) => !a.result)
                  .map((answer, idx) => (
                    <View key={idx} style={styles.violationItem}>
                      <View style={styles.violationHeader}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#60a5fa"
                        />
                        <Text style={styles.violationCategory}>
                          {answer.category}
                        </Text>
                      </View>
                      <Text style={styles.violationName}>
                        {answer.check_item.name}
                      </Text>
                      {answer.comment ? (
                        <Text style={styles.violationComment}>
                          {answer.comment}
                        </Text>
                      ) : null}

                      {answer.location?.latitude &&
                        answer.location?.longitude && (
                          <View style={styles.locationBlock}>
                            <View style={styles.locationHeader}>
                              <Ionicons
                                name="location"
                                size={16}
                                color="#60a5fa"
                              />
                              <Text style={styles.locationTitle}>
                                Координаты
                              </Text>
                            </View>

                            <Text style={styles.locationText}>
                              Широта: {answer.location.latitude}
                            </Text>

                            <Text style={styles.locationText}>
                              Долгота: {answer.location.longitude}
                            </Text>

                            {/* <TouchableOpacity
                              style={styles.mapButton}
                              onPress={() => {
                                const url = `https://maps.google.com/?q=${answer.location?.latitude},${answer.location?.longitude}`;

                                Alert.alert(
                                  "Координаты",
                                  `${answer.location?.latitude}, ${answer.location?.longitude}`,
                                );
                              }}
                            >
                              <Ionicons
                                name="map-outline"
                                size={16}
                                color="#fff"
                              />
                              <Text style={styles.mapButtonText}>
                                Показать координаты
                              </Text>
                            </TouchableOpacity> */}
                          </View>
                        )}

                      {answer.photos.length > 0 && (
                        <FlatList
                          horizontal
                          data={answer.photos}
                          keyExtractor={(p) => p}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.modalPhotoList}
                          renderItem={({ item: photo }) => (
                            <Image
                              source={{ uri: `${API_URL}/images/${photo}` }}
                              style={styles.modalPhoto}
                            />
                          )}
                        />
                      )}
                    </View>
                  ))}
              </ScrollView>
            )}
          </View>
        </BlurView>
      </Modal>

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
  heroCard: {
    overflow: "hidden",
    borderRadius: 30,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 26,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
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
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 4,
  },
  cardDate: {
    color: "#64748b",
    fontSize: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(96, 165, 250, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "600",
  },
  photoList: {
    paddingRight: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#1e293b",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    opacity: 0.7,
  },
  tapHintText: {
    color: "#64748b",
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "85%",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  detailInfo: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  detailLabel: {
    color: "#64748b",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  detailAddress: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  violationItem: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  violationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  violationCategory: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  violationName: {
    color: "#e2e8f0",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  violationComment: {
    color: "#94a3b8",
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 12,
  },
  modalPhotoList: {
    paddingRight: 10,
  },
  modalPhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#1e293b",
  },
  locationBlock: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.15)",
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  locationTitle: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "700",
  },

  locationText: {
    color: "#cbd5e1",
    fontSize: 13,
    marginBottom: 4,
  },

  mapButton: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mapButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
