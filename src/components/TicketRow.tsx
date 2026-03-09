import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ticket } from "../store/types";
import { colors } from "../theme";

type Props = {
  ticket: Ticket;
  onPress: () => void;
};

export default function TicketRow({ ticket, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <Text style={styles.title}>{ticket.title}</Text>
      <Text style={styles.text}>{ticket.process}</Text>
      <Text style={styles.text}>{ticket.adress}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  text: { color: colors.subtext },
});
