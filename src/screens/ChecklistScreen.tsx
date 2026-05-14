import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { CheckItem, Category } from "../services/api";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Checklist">;

export default function ChecklistScreen({ route }: Props) {
  const { vsp, process } = route.params;
  const [query, setQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  const getLevelColor = (level: number) => {
    switch (level) {
      case 3:
        return "#ff4444";
      case 2:
        return "#ffaa00";
      default:
        return "#44aa44";
    }
  };

  const filteredCategories = process.categories
    .map((cat) => ({
      ...cat,
      checkitems: cat.checkitems.filter((item) =>
        item.check_item_description.toLowerCase().includes(query.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.checkitems.length > 0);

  const totalItems = process.categories.reduce(
    (sum, cat) => sum + cat.checkitems.length,
    0,
  );
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.vspName}>{vsp.vsp_name}</Text>
        <Text style={styles.processName}>{process.process_name}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {checkedCount} / {totalItems}
        </Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Поиск по чек-листу"
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

            {item.checkitems.map((checkItem) => (
              <TouchableOpacity
                key={checkItem.check_item_id}
                style={styles.checkItem}
                onPress={() => toggleItem(checkItem.check_item_id)}
              >
                <View style={styles.checkItemHeader}>
                  <View
                    style={[
                      styles.checkbox,
                      checkedItems.has(checkItem.check_item_id) &&
                        styles.checkboxChecked,
                    ]}
                  >
                    {checkedItems.has(checkItem.check_item_id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: getLevelColor(checkItem.level_value) },
                    ]}
                  >
                    <Text style={styles.levelText}>{checkItem.level_name}</Text>
                  </View>
                </View>
                <Text style={styles.description}>
                  {checkItem.check_item_description}
                </Text>
                {expandedCategories.has(item.category_id) && (
                  <Text style={styles.document}>
                    {checkItem.check_item_document}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
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
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    color: colors.text,
    fontSize: 14,
    minWidth: 60,
  },
  search: {
    backgroundColor: colors.card,
    color: colors.text,
    padding: 10,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#2a2a2a",
  },
  categoryName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  expandIcon: {
    color: colors.text,
    fontSize: 14,
  },
  checkItem: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
  },
  checkItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  document: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
    fontStyle: "italic",
  },
});
