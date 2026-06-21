import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import type { BattleStatus } from '../../types/enums';

const STATUS_CONFIG: Record<BattleStatus, { label: string; bg: string; text: string }> = {
  pending_period: { label: '협상 중', bg: COLORS.blush, text: COLORS.textPrimary },
  period_rejected: { label: '재협상', bg: COLORS.blush, text: COLORS.textPrimary },
  pending_stock_selection: { label: '종목 선택', bg: COLORS.sky, text: COLORS.textPrimary },
  active: { label: '겨루는 중', bg: COLORS.clay, text: '#FFFFFF' },
  finished: { label: '승부 끝', bg: COLORS.surfaceSoft, text: COLORS.textSecondary },
  cancelled: { label: '취소됨', bg: COLORS.surfaceSoft, text: COLORS.disabled },
};

interface StatusBadgeProps {
  status: BattleStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
