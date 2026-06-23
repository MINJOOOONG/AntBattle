import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const signup = useAuthStore((s) => s.signup);

  const handleSignup = async () => {
    setError(null);
    setStatusMsg(null);

    if (!email.trim() || !nickname.trim() || !handle.trim() || !password) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    setStatusMsg('서버에 연결 중... (처음 접속 시 30-60초 소요될 수 있습니다)');

    let done = false;
    try {
      await signup(email.trim(), nickname.trim(), handle.trim(), password);
      done = true;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message
        ?? e?.message
        ?? '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setError(msg);
    } finally {
      if (!done) {
        setLoading(false);
        setStatusMsg(null);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>회원가입</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {statusMsg && !error && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{statusMsg}</Text>
          </View>
        )}

        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="닉네임 (2-20자)"
          maxLength={20}
          editable={!loading}
        />

        <Text style={styles.label}>핸들</Text>
        <TextInput
          style={styles.input}
          value={handle}
          onChangeText={setHandle}
          placeholder="@handle (영문, 숫자, 언더스코어)"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="6자 이상"
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="비밀번호 재입력"
          secureTextEntry
          editable={!loading}
        />

        <Button title="가입하기" onPress={handleSignup} loading={loading} style={{ marginTop: 24 }} />
        <Button
          title="로그인으로 돌아가기"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ marginTop: 12 }}
          disabled={loading}
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
  errorBox: {
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#C0392B',
    fontSize: 14,
    textAlign: 'center',
  },
  statusBox: {
    backgroundColor: '#EAF4FB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  statusText: {
    color: '#2471A3',
    fontSize: 13,
    textAlign: 'center',
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
