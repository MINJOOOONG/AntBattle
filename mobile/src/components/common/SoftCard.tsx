import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface SoftCardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'soft';
  style?: StyleProp<ViewStyle>;
}

export default function SoftCard({ children, variant = 'surface', style }: SoftCardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'soft' && styles.soft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#3F3A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  soft: {
    backgroundColor: COLORS.surfaceSoft,
  },
});
