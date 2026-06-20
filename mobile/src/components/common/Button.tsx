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
  const bgColor = variant === 'primary' ? COLORS.primary : variant === 'danger' ? COLORS.danger : 'transparent';
  const textColor = variant === 'secondary' ? COLORS.primary : '#FFFFFF';
  const borderColor = variant === 'secondary' ? COLORS.primary : 'transparent';

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor, borderColor, borderWidth: variant === 'secondary' ? 2 : 0, opacity: disabled ? 0.5 : 1 }, style]}
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
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
