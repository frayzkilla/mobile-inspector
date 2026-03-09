import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { colors } from "../theme";
import { ViolationInstance } from "../store/types";

type Props = {
  name: string;
  level: string;
};

export default function ViolationItem({ name, level }: Props) {
  const [instances, setInstances] = useState<ViolationInstance[]>([]);
  const [description, setDescription] = useState("");
  const [ip, setIp] = useState("");

  const addInstance = async () => {
    const res = await ImagePicker.launchCameraAsync();

    if (res.canceled) return;

    setInstances((prev) => [
      ...prev,
      {
        id: uuidv4(),
        description,
        ip,
        photos: [{ id: uuidv4(), uri: res.assets[0].uri }],
      },
    ]);

    setDescription("");
    setIp("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.level}>{level}</Text>

      <TextInput
        style={styles.input}
        placeholder="Описание"
        placeholderTextColor="#777"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="IP (необязательно)"
        placeholderTextColor="#777"
        value={ip}
        onChangeText={setIp}
      />

      <Button title="Добавить нарушение" onPress={addInstance} />

      <FlatList
        data={instances}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.instance}>
            <Text style={styles.text}>{item.description}</Text>
            <Text style={styles.text}>{item.ip}</Text>

            <FlatList
              horizontal
              data={item.photos}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => (
                <Image source={{ uri: item.uri }} style={styles.photo} />
              )}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { color: colors.text, fontWeight: "600" },
  level: { color: colors.subtext, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  instance: { marginTop: 10 },
  text: { color: colors.text },
  photo: { width: 90, height: 90, borderRadius: 6, marginRight: 8 },
});
