import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ViolationItem from "./ViolationItem";
import { colors } from "../theme";
import { ChecklistGroup } from "../store/types";

type Props = {
  group: ChecklistGroup;
};

export default function GroupBlock({ group }: Props) {
  return (
    <View style={styles.block}>
      <Text style={styles.title}>{group.group}</Text>

      {group.violations.map((v) => (
        <ViolationItem key={v.name} name={v.name} level={v.level} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 20 },
  title: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
});
