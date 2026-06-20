import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useFriendStore } from '../../store/friendStore';
import { getRankName, getRankColor } from '../../constants/ranks';
import Button from '../../components/common/Button';
import type { User, Friendship } from '../../types/models';

export default function FriendListScreen() {
  const { friends, incoming, outgoing, isLoading, loadFriends, loadRequests, respondToRequest } = useFriendStore();
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    setRespondingId(friendshipId);
    try {
      await respondToRequest(friendshipId, accept);
      await loadRequests();
      if (accept) await loadFriends();
    } catch {
      // ignore
    } finally {
      setRespondingId(null);
    }
  };

  const renderFriend = ({ item }: { item: User }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendEmoji}>🐜</Text>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.nickname}</Text>
        <Text style={styles.friendHandle}>@{item.handle}</Text>
      </View>
      <Text style={[styles.friendRank, { color: getRankColor(item.rankScore) }]}>
        {getRankName(item.rankScore)}
      </Text>
    </View>
  );

  const renderRequest = ({ item }: { item: Friendship }) => {
    const user = item.requester;
    if (!user) return null;
    return (
      <View style={styles.friendItem}>
        <Text style={styles.friendEmoji}>🐜</Text>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{user.nickname}</Text>
          <Text style={styles.friendHandle}>@{user.handle}</Text>
        </View>
        <View style={styles.requestActions}>
          <Button
            title="수락"
            onPress={() => handleRespond(item.id, true)}
            loading={respondingId === item.id}
            style={styles.acceptBtn}
          />
          <Button
            title="거절"
            onPress={() => handleRespond(item.id, false)}
            variant="danger"
            loading={respondingId === item.id}
            style={styles.rejectBtn}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'friends' && styles.tabActive]}
          onPress={() => setTab('friends')}
        >
          <Text style={[styles.tabText, tab === 'friends' && styles.tabTextActive]}>
            친구 ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'requests' && styles.tabActive]}
          onPress={() => setTab('requests')}
        >
          <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>
            받은 요청 ({incoming.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'friends' ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriend}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadFriends} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🐜</Text>
              <Text style={styles.emptyText}>아직 친구가 없습니다.</Text>
              <Text style={styles.emptySubText}>친구 찾기에서 친구를 추가해보세요!</Text>
            </View>
          }
          contentContainerStyle={friends.length === 0 ? styles.emptyContainer : undefined}
        />
      ) : (
        <FlatList
          data={incoming}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadRequests} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>받은 친구 요청이 없습니다.</Text>
            </View>
          }
          contentContainerStyle={incoming.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 12,
  },
  friendEmoji: {
    fontSize: 32,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  friendHandle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  friendRank: {
    fontSize: 13,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    paddingHorizontal: 12,
    height: 36,
  },
  rejectBtn: {
    paddingHorizontal: 12,
    height: 36,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
