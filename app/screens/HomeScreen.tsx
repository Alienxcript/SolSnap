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
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useWallet, formatPublicKey, formatSOL } from '../contexts/WalletContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  participants: number;
  prizePool: number;
  joined?: boolean; // ✅ Track if user joined
}

export const HomeScreen = ({ navigation }: any) => {
  const { publicKey, isConnected, balance, connect, disconnect } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userStreak] = useState(7);
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChallenges();
  }, []);

  // ✅ Reload challenges when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      loadChallenges();
    }, [joinedChallenges])
  );

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
        joined: joinedChallenges.has('1'), // ✅ Check if joined
      },
      {
        id: '2',
        title: '🥗 Healthy Meal',
        description: 'Share your nutritious breakfast',
        stakeAmount: 0.05,
        deadline: new Date(Date.now() + 12 * 3600 * 1000),
        participants: 45,
        prizePool: 0.8,
        joined: joinedChallenges.has('2'),
      },
      {
        id: '3',
        title: '💪 Morning Workout',
        description: 'Post evidence of your exercise routine',
        stakeAmount: 0.15,
        deadline: new Date(Date.now() + 10 * 3600 * 1000),
        participants: 18,
        prizePool: 0.3,
        joined: joinedChallenges.has('3'),
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

  const handleChallengePress = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetail', { 
      challenge,
      onJoinSuccess: (challengeId: string) => {
        // ✅ Update joined state when user joins
        setJoinedChallenges(prev => new Set(prev).add(challengeId));
        loadChallenges(); // Reload to update UI
      }
    });
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <TouchableOpacity 
      style={styles.challengeCard} 
      activeOpacity={0.85}
      onPress={() => handleChallengePress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.challengeTitle}>{item.title}</Text>
        <LinearGradient
          colors={['#14F195', '#0EA97F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.stakeBadge}
        >
          <Text style={styles.stakeText}>{item.stakeAmount} SOL</Text>
        </LinearGradient>
      </View>
      
      {/* ✅ Show "Joined" badge with gradient */}
      {item.joined && (
        <LinearGradient
          colors={['#FFD93D', '#F6C744']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.joinedBadge}
        >
          <Text style={styles.joinedText}>✓ Joined</Text>
        </LinearGradient>
      )}
      
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
      <LinearGradient
        colors={item.joined ? ['#14F195', '#0EA97F'] : ['#9945FF', '#7928CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.joinButtonPreview}
      >
        <Text style={styles.joinButtonPreviewText}>
          {item.joined ? 'View details →' : 'Tap to view & join →'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SolSnap</Text>
          <Text style={styles.headerSubtitle}>Daily Challenges</Text>
        </View>
        
        {/* ✅ FIX 5: Wallet button navigates to Profile instead of disconnect */}
        <TouchableOpacity
          style={styles.walletButton}
          onPress={() => {
            if (isConnected) {
              navigation.navigate('Profile'); // ✅ Navigate to profile
            } else {
              connect();
            }
          }}
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
  container: { 
    flex: 1, 
    backgroundColor: '#0A0A0A',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20, 
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#14F195',
    letterSpacing: -0.5,
  },
  headerSubtitle: { 
    fontSize: 14, 
    color: '#888888', 
    marginTop: 4,
    fontWeight: '500',
  },
  walletButton: { 
    backgroundColor: '#9945FF', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12,
    shadowColor: '#9945FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  walletAddress: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  walletBalance: { 
    color: '#14F195', 
    fontSize: 11, 
    marginTop: 2,
    fontWeight: '600',
  },
  connectText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  streakBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#141414',
    marginHorizontal: 20, 
    marginTop: 16, 
    padding: 16, 
    borderRadius: 16,
    borderLeftWidth: 4, 
    borderLeftColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  streakEmoji: { 
    fontSize: 32, 
    marginRight: 12 
  },
  streakText: { 
    color: '#FFD700', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  streakSubtext: { 
    color: '#888888', 
    fontSize: 12, 
    marginTop: 2,
    fontWeight: '500',
  },
  listContent: { 
    padding: 20, 
    paddingBottom: 100 
  },
  challengeCard: { 
    backgroundColor: '#141414',
    borderRadius: 20,
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  challengeTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    flex: 1,
    letterSpacing: -0.3,
  },
  stakeBadge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10,
    shadowColor: '#14F195',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stakeText: { 
    color: '#000000', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  joinedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    shadowColor: '#FFD93D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  joinedText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeDescription: { 
    color: '#AAAAAA', 
    fontSize: 14, 
    marginBottom: 16, 
    lineHeight: 20 
  },
  cardStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#1F1F1F',
  },
  statItem: { 
    flex: 1 
  },
  statLabel: { 
    color: '#666666', 
    fontSize: 11, 
    marginBottom: 4, 
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: { 
    color: '#14F195', 
    fontSize: 16, 
    fontWeight: '700',
  },
  statValueWarning: { 
    color: '#FF6B6B', 
    fontSize: 16, 
    fontWeight: '700',
  },
  joinButtonPreview: { 
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#9945FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButtonPreviewText: { 
    color: '#FFFFFF', 
    fontSize: 15,
    fontWeight: '700',
  },
  connectPrompt: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#141414',
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#1F1F1F',
    paddingBottom: 40,
  },
  connectPromptText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    marginBottom: 12, 
    textAlign: 'center',
    fontWeight: '500',
  },
  connectPromptButton: { 
    backgroundColor: '#14F195', 
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#14F195',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  connectPromptButtonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
