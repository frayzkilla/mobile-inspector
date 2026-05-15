import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/navigation";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Checklist">;

interface Violation {
  id: string;
  comment: string;
  photos: string[];
  createdAt: string;
}

export default function ChecklistScreen({ route, navigation }: Props) {
  const { vsp, process } = route.params;

  const [query, setQuery] = useState("");

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const [violations, setViolations] = useState<Record<string, Violation[]>>({});

  const [modalVisible, setModalVisible] = useState(false);

  const [violationsModalVisible, setViolationsModalVisible] = useState(false);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [editingViolationId, setEditingViolationId] = useState<string | null>(
    null,
  );

  const [comment, setComment] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();

      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

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

  const openCreateViolation = (checkItemId: string) => {
    setSelectedItemId(checkItemId);
    setEditingViolationId(null);
    setComment("");
    setPhotos([]);
    setModalVisible(true);
  };

  const openViolationList = (checkItemId: string) => {
    setSelectedItemId(checkItemId);
    setViolationsModalVisible(true);
  };

  const editViolation = (checkItemId: string, violation: Violation) => {
    setSelectedItemId(checkItemId);
    setEditingViolationId(violation.id);
    setComment(violation.comment);
    setPhotos(violation.photos);
    setViolationsModalVisible(false);
    setModalVisible(true);
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

    if (editingViolationId) {
      setViolations((prev) => ({
        ...prev,
        [selectedItemId]: (prev[selectedItemId] || []).map((v) =>
          v.id === editingViolationId
            ? {
                ...v,
                comment,
                photos,
              }
            : v,
        ),
      }));
    } else {
      const newViolation: Violation = {
        id: Date.now().toString(),
        comment,
        photos,
        createdAt: new Date().toISOString(),
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
          });
        });
      });

      formData.append("vspId", String(vsp.vsp_id));

      formData.append("processId", process.process_id);

      formData.append("answers", JSON.stringify(answers));

      console.log(formData);

      const response = await fetch("http://158.160.228.123:8777/checks", {
        method: "POST",
        body: formData,
      });

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.vspName}>{vsp.vsp_name}</Text>

        <Text style={styles.processName}>{process.process_name}</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Поиск"
        placeholderTextColor="#777"
        value={query}
        onChangeText={setQuery}
      />

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.category_id}
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(item.category_id)}
            >
              <Text style={styles.categoryName}>{item.category_name}</Text>

              <Text style={styles.expandIcon}>
                {expandedCategories.has(item.category_id) ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>

            {item.checkitems.map((checkItem) => {
              const count = violations[checkItem.check_item_id]?.length || 0;

              return (
                <TouchableOpacity
                  key={checkItem.check_item_id}
                  style={styles.checkItem}
                  onPress={() => openCreateViolation(checkItem.check_item_id)}
                >
                  <View style={styles.row}>
                    <Text style={styles.description}>
                      {checkItem.check_item_description}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.counter,
                        {
                          backgroundColor: count === 0 ? "#555" : "#2eaa44",
                        },
                      ]}
                      onPress={() => openViolationList(checkItem.check_item_id)}
                    >
                      <Text style={styles.counterText}>{count}</Text>
                    </TouchableOpacity>
                  </View>

                  {expandedCategories.has(item.category_id) && (
                    <Text style={styles.document}>
                      {checkItem.check_item_document}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      <TouchableOpacity style={styles.finishButton} onPress={submitCheck}>
        <Text style={styles.finishButtonText}>Завершить проверку</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Нарушение</Text>

          <TextInput
            style={styles.commentInput}
            placeholder="Комментарий"
            placeholderTextColor="#777"
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Text style={styles.photoButtonText}>Сделать фото</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickFromGallery}
          >
            <Text style={styles.photoButtonText}>Загрузить из галереи</Text>
          </TouchableOpacity>

          <View style={styles.photos}>
            {photos.map((photo) => (
              <View key={photo} style={styles.imageWrapper}>
                <Image source={{ uri: photo }} style={styles.image} />

                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => removePhoto(photo)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveViolation}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      <Modal visible={violationsModalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Нарушения</Text>

          <FlatList
            data={selectedItemId ? violations[selectedItemId] || [] : []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.violationCard}>
                <Text style={styles.violationText}>
                  {item.comment || "Без комментария"}
                </Text>

                <ScrollView horizontal>
                  {item.photos.map((photo) => (
                    <Image
                      key={photo}
                      source={{ uri: photo }}
                      style={styles.violationImage}
                    />
                  ))}
                </ScrollView>

                <View style={styles.violationButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editViolation(selectedItemId!, item)}
                  >
                    <Text style={styles.editButtonText}>Редактировать</Text>
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

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setViolationsModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  header: {
    marginBottom: 16,
  },

  vspName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  processName: {
    color: "#888",
    marginTop: 4,
  },

  search: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },

  categoryHeader: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#2a2a2a",
  },

  categoryName: {
    color: colors.text,
    fontWeight: "600",
  },

  expandIcon: {
    color: colors.text,
  },

  checkItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  description: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingRight: 12,
  },

  counter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  counterText: {
    color: "#fff",
    fontWeight: "700",
  },

  document: {
    color: "#888",
    marginTop: 8,
    fontSize: 12,
  },

  finishButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },

  finishButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  modal: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },

  commentInput: {
    backgroundColor: colors.card,
    color: colors.text,
    minHeight: 120,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: "top",
  },

  photoButton: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },

  photoButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  photos: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },

  imageWrapper: {
    position: "relative",
    marginRight: 8,
    marginBottom: 8,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  removePhoto: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },

  removePhotoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },

  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  cancelButton: {
    padding: 16,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#888",
    fontSize: 16,
  },

  violationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  violationText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 12,
  },

  violationImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 8,
  },

  violationButtons: {
    flexDirection: "row",
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#aa3333",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
