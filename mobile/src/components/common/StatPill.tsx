import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface StatPillProps {
  label: string;
  value: string | number;
  color?: string;
}

export default function StatPill({ label, value, color }: StatPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color } : undefined]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
