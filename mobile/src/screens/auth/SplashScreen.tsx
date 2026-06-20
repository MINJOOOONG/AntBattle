import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import type { AuthScreenProps } from '../../navigation/types';

export default function SplashScreen({ navigation }: AuthScreenProps<'Splash'>) {
  const { loadSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        navigation.replace('Login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🐜</Text>
      <Text style={styles.title}>개미배틀</Text>
      <Text style={styles.subtitle}>친구와 함께하는 모의투자 배틀</Text>
      <Text style={styles.disclaimer}>
        본 앱은 실제 주식 거래와 무관한 게임입니다.{'\n'}
        실제 투자 판단에 활용하지 마세요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 48,
  },
  disclaimer: {
    position: 'absolute',
    bottom: 60,
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
