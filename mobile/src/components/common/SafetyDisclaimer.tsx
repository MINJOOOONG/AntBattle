import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function SafetyDisclaimer() {
  return (
    <Text style={styles.text}>
      개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다.{'\n'}
      표시되는 수익률과 종목 정보는 게임/학습 목적의 콘텐츠입니다.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
