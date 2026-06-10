import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Speech from "expo-speech";
// import {
//   ExpoSpeechRecognitionModule,
//   useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Checklist">;

interface Violation {
  id: string;
  comment: string;
  photos: string[];
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
}

export default function ChecklistScreen({ route, navigation }: Props) {
  const { vsp, process } = route.params;

  const [query, setQuery] = useState("");

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(process.categories.map((c) => c.category_id)),
  );

  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  const [violations, setViolations] = useState<Record<string, Violation[]>>({});

  const [modalVisible, setModalVisible] = useState(false);

  const [violationsModalVisible, setViolationsModalVisible] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [selectedItemInfo, setSelectedItemInfo] = useState<{
    name: string;
    category: string;
  } | null>(null);

  const [editingViolationId, setEditingViolationId] = useState<string | null>(
    null,
  );

  const [comment, setComment] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

  const [isRecording, setIsRecording] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await Location.requestForegroundPermissionsAsync();

      // const permissions =
      //   await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      // if (!permissions.granted) {
      //   Alert.alert(
      //     "Ошибка",
      //     "Необходимо разрешение на использование микрофона",
      //   );
      // }
    })();

    startLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, []);

  // useSpeechRecognitionEvent("result", (event) => {
  //   const transcript = event.results
  //     ?.map((r: any) => r.transcript)
  //     .join(" ");

  //   if (transcript) {
  //     setComment((prev) =>
  //       prev.trim().length > 0
  //         ? `${prev.trim()} ${transcript}`
  //         : transcript,
  //     );
  //   }
  // });

  // useSpeechRecognitionEvent("end", () => {
  //   setIsRecording(false);
  // });

  // useSpeechRecognitionEvent("error", () => {
  //   setIsRecording(false);
  //   Alert.alert("Ошибка", "Не удалось распознать голос");
  // });

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          setCurrentCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        },
      );
    } catch {}
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const filteredCategories = useMemo(() => {
    return process.categories
      .map((cat) => ({
        ...cat,
        checkitems: cat.checkitems.filter((item) =>
          item.check_item_description
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      }))
      .filter((cat) => cat.checkitems.length > 0);
  }, [process.categories, query]);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleDoc = (id: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const openCreateViolation = (
    checkItemId: string,
    itemName: string,
    categoryName: string,
  ) => {
    setSelectedItemId(checkItemId);

    setSelectedItemInfo({
      name: itemName,
      category: categoryName,
    });

    setEditingViolationId(null);

    setComment("");

    setPhotos([]);

    setModalVisible(true);
  };

  const openViolationList = (checkItemId: string) => {
    setSelectedItemId(checkItemId);
    setViolationsModalVisible(true);
  };

  const editViolation = (
    checkItemId: string,
    violation: Violation,
    itemName: string,
    categoryName: string,
  ) => {
    setSelectedItemId(checkItemId);

    setSelectedItemInfo({
      name: itemName,
      category: categoryName,
    });

    setEditingViolationId(violation.id);

    setComment(violation.comment);

    setPhotos(violation.photos);

    setViolationsModalVisible(false);

    setModalVisible(true);
  };

  const startVoiceInput = async () => {
    // try {
    //   setIsRecording(true);
    //   await ExpoSpeechRecognitionModule.start({
    //     lang: "ru-RU",
    //     interimResults: true,
    //     continuous: false,
    //     maxAlternatives: 1,
    //     requiresOnDeviceRecognition: false,
    //   });
    // } catch {
    //   setIsRecording(false);
    //   Alert.alert("Ошибка", "Не удалось начать запись");
    // }
  };

  const stopVoiceInput = async () => {
    // try {
    //   await ExpoSpeechRecognitionModule.stop();
    //   setIsRecording(false);
    // } catch {
    //   setIsRecording(false);
    // }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch {
      Alert.alert("Ошибка", "Не удалось открыть камеру");
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uris = result.assets.map((a) => a.uri);

        setPhotos((prev) => [...prev, ...uris]);
      }
    } catch {
      Alert.alert("Ошибка", "Не удалось открыть галерею");
    }
  };

  const removePhoto = (photo: string) => {
    setPhotos((prev) => prev.filter((p) => p !== photo));
  };

  const saveViolation = () => {
    if (!selectedItemId) return;

    const payload = {
      comment,
      photos,
      latitude: currentCoords.latitude,
      longitude: currentCoords.longitude,
    };

    if (editingViolationId) {
      setViolations((prev) => ({
        ...prev,
        [selectedItemId]: (prev[selectedItemId] || []).map((v) =>
          v.id === editingViolationId
            ? {
                ...v,
                ...payload,
              }
            : v,
        ),
      }));
    } else {
      const newViolation: Violation = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...payload,
      };

      setViolations((prev) => ({
        ...prev,
        [selectedItemId]: [...(prev[selectedItemId] || []), newViolation],
      }));
    }

    setModalVisible(false);
  };

  const deleteViolation = (checkItemId: string, violationId: string) => {
    setViolations((prev) => ({
      ...prev,
      [checkItemId]: (prev[checkItemId] || []).filter(
        (v) => v.id !== violationId,
      ),
    }));
  };

  const submitCheck = async () => {
    try {
      const formData = new FormData();

      const answers: any[] = [];

      Object.entries(violations).forEach(([checkItemId, items]) => {
        items.forEach((violation, index) => {
          const photoNames: string[] = [];

          violation.photos.forEach((uri, photoIndex) => {
            const filename = `${checkItemId}_${index}_${photoIndex}.jpg`;

            photoNames.push(filename);

            formData.append("files", {
              uri,
              name: filename,
              type: "image/jpeg",
            } as any);
          });

          answers.push({
            check_item_id: checkItemId,
            result: false,
            comment: violation.comment,
            photos: photoNames,
            location: {
              latitude: violation.latitude,
              longitude: violation.longitude,
            },
            created_at: violation.createdAt,
          });
        });
      });

      console.log("Submitting check with answers:", answers);

      formData.append("vspId", String(vsp.vsp_id));

      formData.append("processId", process.process_id);

      formData.append("answers", JSON.stringify(answers));

      const response = await fetch(
        "https://tvldw-nscan0004.delta.sbrf.ru/mobile-backend/api/v1/objects/checks/",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      Alert.alert("Успех", "Проверка завершена");

      navigation.goBack();
    } catch {
      Alert.alert("Ошибка", "Не удалось отправить проверку");
    }
  };

  return (
    <LinearGradient
      colors={["#0b1120", "#111827", "#1e293b"]}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.vspName}>{vsp.vsp_name}</Text>

        <Text style={styles.processName}>{process.process_name}</Text>
      </View>

      <BlurView intensity={40} tint="dark" style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#94a3b8"
          style={{ marginRight: 10 }}
        />

        <TextInput
          style={styles.search}
          placeholder="Поиск..."
          placeholderTextColor="#64748b"
          value={query}
          onChangeText={setQuery}
        />
      </BlurView>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.category_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(item.category_id)}
            >
              <Text style={styles.categoryName}>{item.category_name}</Text>

              <Ionicons
                name={
                  expandedCategories.has(item.category_id)
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>

            {expandedCategories.has(item.category_id) &&
              item.checkitems.map((checkItem) => {
                const count = violations[checkItem.check_item_id]?.length || 0;

                const isDocExpanded = expandedDocs.has(checkItem.check_item_id);

                const isHighRisk = checkItem.level_value >= 3;

                return (
                  <View
                    key={checkItem.check_item_id}
                    style={styles.checkItemContainer}
                  >
                    <TouchableOpacity
                      style={styles.checkItem}
                      onPress={() =>
                        openCreateViolation(
                          checkItem.check_item_id,
                          checkItem.check_item_description,
                          item.category_name,
                        )
                      }
                    >
                      <View style={styles.row}>
                        <View style={styles.textGroup}>
                          <View style={styles.titleRow}>
                            <View
                              style={[
                                styles.dot,
                                {
                                  backgroundColor: isHighRisk
                                    ? "rgba(248, 113, 113, 0.9)"
                                    : "rgba(251, 191, 36, 0.9)",
                                },
                              ]}
                            />

                            <Text style={styles.description}>
                              {checkItem.check_item_description}
                            </Text>
                          </View>

                          <View style={styles.metaRow}>
                            <TouchableOpacity
                              style={styles.docToggle}
                              onPress={(e) => {
                                e.stopPropagation();

                                toggleDoc(checkItem.check_item_id);
                              }}
                            >
                              <Text style={styles.docToggleText}>
                                {isDocExpanded
                                  ? "Скрыть документ"
                                  : "Показать документ"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.counter,
                            {
                              backgroundColor:
                                count > 0
                                  ? "rgba(59, 130, 246, 0.15)"
                                  : "rgba(255,255,255,0.03)",
                            },
                          ]}
                          onPress={(e) => {
                            e.stopPropagation();

                            openViolationList(checkItem.check_item_id);
                          }}
                        >
                          <Text
                            style={[
                              styles.counterText,
                              {
                                color: count > 0 ? "#60a5fa" : "#475569",
                              },
                            ]}
                          >
                            {count}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {isDocExpanded && (
                        <View style={styles.docBlock}>
                          <Text style={styles.documentText}>
                            {checkItem.check_item_document}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
        )}
      />

      <TouchableOpacity style={styles.finishButton} onPress={submitCheck}>
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.finishButtonGradient}
        >
          <Text style={styles.finishButtonText}>Завершить проверку</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Нарушение</Text>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {selectedItemInfo && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Категория</Text>

                <Text style={styles.infoValue}>
                  {selectedItemInfo.category}
                </Text>

                <Text style={[styles.infoLabel, { marginTop: 12 }]}>
                  Пункт проверки
                </Text>

                <Text style={styles.infoValueText}>
                  {selectedItemInfo.name}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Комментарий</Text>

              <View style={styles.commentWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Опишите нарушение..."
                  placeholderTextColor="#64748b"
                  multiline
                  value={comment}
                  onChangeText={setComment}
                />

                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    {
                      backgroundColor: isRecording
                        ? "rgba(239,68,68,0.2)"
                        : "rgba(59,130,246,0.15)",
                    },
                  ]}
                  onPress={isRecording ? stopVoiceInput : startVoiceInput}
                >
                  <Ionicons
                    name={isRecording ? "stop" : "mic"}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Фото</Text>

              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoActionButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoActionButton}
                  onPress={pickFromGallery}
                >
                  <Ionicons name="images-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <FlatList
                horizontal
                data={photos}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosList}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => setPreviewPhoto(item)}>
                    <View style={styles.imageWrapper}>
                      <Image source={{ uri: item }} style={styles.image} />

                      <TouchableOpacity
                        style={styles.removePhoto}
                        onPress={() => removePhoto(item)}
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                )}
              />

              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveViolation}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </BlurView>
      </Modal>

      <Modal
        visible={violationsModalVisible}
        animationType="slide"
        transparent={true}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Найдено</Text>

              <TouchableOpacity
                onPress={() => setViolationsModalVisible(false)}
              >
                <Ionicons name="close" size={28} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedItemId ? violations[selectedItemId] || [] : []}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.violationCard}>
                  <Text style={styles.violationText}>
                    {item.comment || "Без комментария"}
                  </Text>

                  <FlatList
                    horizontal
                    data={item.photos}
                    keyExtractor={(p, i) => i.toString()}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.violationPhotos}
                    renderItem={({ item: photo }) => (
                      <TouchableOpacity onPress={() => setPreviewPhoto(photo)}>
                        <Image
                          source={{ uri: photo }}
                          style={styles.violationImage}
                        />
                      </TouchableOpacity>
                    )}
                  />

                  <View style={styles.violationButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        const currentItem = process.categories
                          .flatMap((c) => c.checkitems)
                          .find((ci) => ci.check_item_id === selectedItemId);

                        if (currentItem) {
                          const cat = process.categories.find(
                            (c) =>
                              c.category_id ===
                              (currentItem as any).category_id,
                          );

                          editViolation(
                            selectedItemId!,
                            item,
                            currentItem.check_item_description,
                            cat?.category_name || "",
                          );
                        }
                      }}
                    >
                      <Text style={styles.editButtonText}>Изменить</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteViolation(selectedItemId!, item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Удалить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </BlurView>
      </Modal>

      <Modal
        visible={!!previewPhoto}
        transparent={true}
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setPreviewPhoto(null)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>

          {previewPhoto && (
            <Image
              source={{ uri: previewPhoto }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 140,
    paddingBottom: 10,
  },
  vspName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  processName: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  search: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categoryCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  categoryHeader: {
    padding: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  categoryName: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  checkItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  checkItem: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  textGroup: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  description: {
    flex: 1,
    color: "#f1f5f9",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    flexShrink: 0,
  },
  docToggle: {
    paddingVertical: 2,
  },
  docToggleText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  counter: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  counterText: {
    fontSize: 14,
    fontWeight: "700",
  },
  docBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  documentText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
  },
  finishButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  finishButtonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "92%",
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  infoBlock: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
  },
  infoValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },
  infoValueText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 8,
  },
  commentWrapper: {
    position: "relative",
  },
  commentInput: {
    backgroundColor: "rgba(255,255,255,0.03)",
    color: "#fff",
    minHeight: 120,
    borderRadius: 16,
    padding: 16,
    paddingRight: 70,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    fontSize: 15,
  },
  voiceButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  photoActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  photoActionButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  photosList: {
    paddingBottom: 10,
  },
  imageWrapper: {
    marginRight: 12,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: "#1e293b",
  },
  removePhoto: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  violationCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  violationText: {
    color: "#e2e8f0",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  violationPhotos: {
    paddingBottom: 12,
  },
  violationImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#1e293b",
  },
  violationButtons: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  editButtonText: {
    color: "#60a5fa",
    fontWeight: "600",
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#f87171",
    fontWeight: "600",
    fontSize: 13,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.98)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewClose: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
});
