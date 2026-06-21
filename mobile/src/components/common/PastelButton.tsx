import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface PastelButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'clay' | 'sky' | 'blush' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const VARIANT_MAP = {
  clay: { bg: COLORS.clay, text: '#FFFFFF' },
  sky: { bg: COLORS.sky, text: '#3F3A36' },
  blush: { bg: COLORS.blush, text: '#3F3A36' },
  ghost: { bg: 'transparent', text: COLORS.clay },
};

export default function PastelButton({
  title,
  onPress,
  variant = 'clay',
  disabled,
  loading,
  style,
}: PastelButtonProps) {
  const colors = VARIANT_MAP[variant];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.bg },
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ghost: {
    borderWidth: 1.5,
    borderColor: COLORS.borderSoft,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
