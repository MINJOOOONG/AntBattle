import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';
import type { AuthScreenProps } from '../../navigation/types';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    setError(null);
    setStatusMsg(null);

    if (!handle.trim() || !password) {
      setError('핸들과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setStatusMsg('서버에 연결 중... (처음 접속 시 30-60초 소요될 수 있습니다)');

    let done = false;
    try {
      await login(handle.trim(), password);
      done = true;
    } catch (e: unknown) {
      let msg = '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
      if (e && typeof e === 'object' && 'response' in e) {
        const res = (e as { response?: { data?: { error?: { message?: string } } } }).response;
        if (res?.data?.error?.message) msg = res.data.error.message;
      } else if (e instanceof Error) {
        msg = e.message;
      }
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
        <Text style={styles.emoji}>🐜</Text>
        <Text style={styles.title}>개미배틀</Text>

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

        <View style={styles.form}>
          <Text style={styles.label}>핸들</Text>
          <TextInput
            style={styles.input}
            value={handle}
            onChangeText={setHandle}
            placeholder="@handle"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            accessibilityLabel="핸들 입력"
          />

          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            secureTextEntry
            editable={!loading}
            accessibilityLabel="비밀번호 입력"
          />

          <Button title="로그인" onPress={handleLogin} loading={loading} style={{ marginTop: 16 }} />
          <Button
            title="회원가입"
            onPress={() => navigation.navigate('Signup')}
            variant="secondary"
            style={{ marginTop: 12 }}
            disabled={loading}
          />
        </View>

        <Text style={styles.disclaimer}>
          본 앱은 실제 주식 거래와 무관한 게임입니다.
        </Text>
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
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
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
  form: {
    gap: 4,
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
  disclaimer: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
});
