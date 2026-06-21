import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({ title, onPress, variant = 'primary', disabled, loading, style }: ButtonProps) {
  const bgColor = variant === 'primary' ? COLORS.clay : variant === 'danger' ? COLORS.danger : 'transparent';
  const textColor = variant === 'secondary' ? COLORS.clay : '#FFFFFF';
  const borderColor = variant === 'secondary' ? COLORS.borderSoft : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor, borderColor, borderWidth: variant === 'secondary' ? 1.5 : 0, opacity: disabled ? 0.5 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
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
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
