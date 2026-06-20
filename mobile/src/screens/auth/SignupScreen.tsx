import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import type { AuthScreenProps } from '../../navigation/types';

export default function SignupScreen({ navigation }: AuthScreenProps<'Signup'>) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const signup = useAuthStore((s) => s.signup);

  const handleSignup = async () => {
    if (!email.trim() || !nickname.trim() || !handle.trim() || !password) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), nickname.trim(), handle.trim(), password);
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? '회원가입에 실패했습니다.';
      Alert.alert('회원가입 실패', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>회원가입</Text>

        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임 (2-20자)"
          maxLength={20}
        />

        <Text style={styles.label}>핸들</Text>
        <TextInput
          style={styles.input}
          value={handle}
          onChangeText={setHandle}
          placeholder="@handle (영문, 숫자, 언더스코어)"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="6자 이상"
          secureTextEntry
        />

        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="비밀번호 재입력"
          secureTextEntry
        />

        <Button title="가입하기" onPress={handleSignup} loading={loading} style={{ marginTop: 24 }} />
        <Button
          title="로그인으로 돌아가기"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
  },
});
