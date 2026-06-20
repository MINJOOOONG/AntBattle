import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useFriendStore } from '../../store/friendStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import Button from '../../components/common/Button';
import AntCharacter from '../../components/ant/AntCharacter';

export default function FriendSearchScreen() {
  const [handle, setHandle] = useState('');
  const [sending, setSending] = useState(false);
  const { searchResult, isLoading, searchUser, sendRequest, clearSearch } = useFriendStore();

  const handleSearch = async () => {
    const trimmed = handle.trim().replace(/^@/, '');
    if (!trimmed) {
      Alert.alert('입력 오류', '핸들을 입력해주세요.');
      return;
    }
    await searchUser(trimmed);
  };

  const handleSendRequest = async () => {
    if (!searchResult) return;
    setSending(true);
    try {
      await sendRequest(searchResult.id);
      Alert.alert('완료', `@${searchResult.handle}님에게 친구 요청을 보냈습니다.`);
      clearSearch();
      setHandle('');
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? '친구 요청에 실패했습니다.';
      Alert.alert('오류', msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={handle}
          onChangeText={setHandle}
          placeholder="@handle 검색"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Button title="검색" onPress={handleSearch} loading={isLoading} style={styles.searchBtn} />
      </View>

      {searchResult && (
        <View style={styles.resultCard}>
          <AntCharacter rankScore={searchResult.rankScore} size="small" />
          <View style={styles.resultInfo}>
            <Text style={styles.resultNickname}>{searchResult.nickname}</Text>
            <Text style={styles.resultHandle}>@{searchResult.handle}</Text>
            <Text style={[styles.resultRank, { color: getRankColor(searchResult.rankScore) }]}>
              {getRankName(searchResult.rankScore)}
            </Text>
          </View>
          <Button title="친구 요청" onPress={handleSendRequest} loading={sending} style={styles.requestBtn} />
        </View>
      )}

      {!isLoading && handle.trim() && !searchResult && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
  },
  searchBtn: {
    width: 80,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultNickname: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  resultHandle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resultRank: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  requestBtn: {
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
