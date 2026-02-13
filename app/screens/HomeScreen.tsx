// app/screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useWallet, formatPublicKey, formatSOL } from '../contexts/WalletContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  participants: number;
  prizePool: number;
}

export const HomeScreen = () => {
  const { publicKey, isConnected, balance, connect, disconnect } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userStreak] = useState(7);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: '🌅 Sunrise Snap',
        description: 'Capture a beautiful sunrise photo',
        stakeAmount: 0.1,
        deadline: new Date(Date.now() + 8 * 3600 * 1000),
        participants: 23,
        prizePool: 0.5,
      },
      {
        id: '2',
        title: '🥗 Healthy Meal',
        description: 'Share your nutritious breakfast',
        stakeAmount: 0.05,
        deadline: new Date(Date.now() + 12 * 3600 * 1000),
        participants: 45,
        prizePool: 0.8,
      },
      {
        id: '3',
        title: '💪 Morning Workout',
        description: 'Post evidence of your exercise routine',
        stakeAmount: 0.15,
        deadline: new Date(Date.now() + 10 * 3600 * 1000),
        participants: 18,
        prizePool: 0.3,
      },
    ];
    setChallenges(mockChallenges);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChallenges();
    setRefreshing(false);
  };

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <TouchableOpacity style={styles.challengeCard} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <View style={styles.stakeBadge}>
          <Text style={styles.stakeText}>{item.stakeAmount} SOL</Text>
        </View>
      </View>
      <Text style={styles.challengeDescription}>{item.description}</Text>
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Participants</Text>
          <Text style={styles.statValue}>{item.participants}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValue}>{item.prizePool.toFixed(2)} SOL</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time Left</Text>
          <Text style={styles.statValueWarning}>{formatTimeRemaining(item.deadline)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Challenge →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SolanaSnap</Text>
          <Text style={styles.headerSubtitle}>Daily Challenges</Text>
        </View>
        <TouchableOpacity
          style={styles.walletButton}
          onPress={isConnected ? disconnect : connect}
        >
          {isConnected ? (
            <View>
              <Text style={styles.walletAddress}>{formatPublicKey(publicKey)}</Text>
              <Text style={styles.walletBalance}>{formatSOL(balance)}</Text>
            </View>
          ) : (
            <Text style={styles.connectText}>Connect Wallet</Text>
          )}
        </TouchableOpacity>
      </View>
      {isConnected && (
        <View style={styles.streakBanner}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakText}>{userStreak} Day Streak!</Text>
            <Text style={styles.streakSubtext}>Keep it going!</Text>
          </View>
        </View>
      )}
      <FlatList
        data={challenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14F195" />}
      />
      {!isConnected && (
        <View style={styles.connectPrompt}>
          <Text style={styles.connectPromptText}>Connect your wallet to join challenges</Text>
          <TouchableOpacity style={styles.connectPromptButton} onPress={connect}>
            <Text style={styles.connectPromptButtonText}>Connect Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#1A1A1A' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#14F195' },
  headerSubtitle: { fontSize: 14, color: '#888888', marginTop: 4 },
  walletButton: { backgroundColor: '#9945FF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  walletAddress: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  walletBalance: { color: '#14F195', fontSize: 11, marginTop: 2 },
  connectText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  streakBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  streakEmoji: { fontSize: 32, marginRight: 12 },
  streakText: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  streakSubtext: { color: '#888888', fontSize: 12, marginTop: 2 },
  listContent: { padding: 20, paddingBottom: 100 },
  challengeCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  challengeTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  stakeBadge: { backgroundColor: '#14F195', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  stakeText: { color: '#000000', fontSize: 12, fontWeight: 'bold' },
  challengeDescription: { color: '#AAAAAA', fontSize: 14, marginBottom: 16, lineHeight: 20 },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  statItem: { flex: 1 },
  statLabel: { color: '#666666', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' },
  statValue: { color: '#14F195', fontSize: 16, fontWeight: '600' },
  statValueWarning: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
  joinButton: { backgroundColor: '#9945FF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  joinButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  connectPrompt: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A1A', padding: 20, borderTopWidth: 1, borderTopColor: '#2A2A2A' },
  connectPromptText: { color: '#FFFFFF', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  connectPromptButton: { backgroundColor: '#14F195', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  connectPromptButtonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});
