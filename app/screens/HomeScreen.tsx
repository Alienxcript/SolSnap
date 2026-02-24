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
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshCw, Users, Trophy, Clock, Info, X } from 'lucide-react-native';
import { useWallet } from '../contexts/WalletContext';

interface Challenge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  participants: number;
  prizePool: number;
  joined?: boolean;
}

export const HomeScreen = ({ navigation }: any) => {
  const { publicKey, isConnected, balance, connect, joinedChallenges, addJoinedChallenge } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showStakeInfo, setShowStakeInfo] = useState(false);
  const [selectedStakeAmount, setSelectedStakeAmount] = useState(0);

  useEffect(() => {
    loadChallenges();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadChallenges();
    }, [joinedChallenges])
  );

  const loadChallenges = async () => {
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        emoji: '🌅',
        title: 'Sunrise Snap',
        description: 'Capture a beautiful sunrise photo before 8AM and share it with the community.',
        stakeAmount: 0.1,
        deadline: new Date(Date.now() + 8 * 3600 * 1000),
        participants: 23,
        prizePool: 0.5,
        joined: joinedChallenges.has('1'),
      },
      {
        id: '2',
        emoji: '🥗',
        title: 'Healthy Meal',
        description: 'Share your nutritious breakfast or lunch. No junk food allowed!',
        stakeAmount: 0.05,
        deadline: new Date(Date.now() + 12 * 3600 * 1000),
        participants: 45,
        prizePool: 0.8,
        joined: joinedChallenges.has('2'),
      },
      {
        id: '3',
        emoji: '💪',
        title: 'Morning Workout',
        description: 'Post evidence of your exercise routine. Gym, run, yoga — anything counts.',
        stakeAmount: 0.15,
        deadline: new Date(Date.now() + 10 * 3600 * 1000),
        participants: 18,
        prizePool: 0.3,
        joined: joinedChallenges.has('3'),
      },
      {
        id: '4',
        emoji: '📚',
        title: 'Reading Hour',
        description: 'Snap a photo of your book with a minimum 30 pages read today.',
        stakeAmount: 0.08,
        deadline: new Date(Date.now() + 16 * 3600 * 1000),
        participants: 31,
        prizePool: 0.6,
        joined: joinedChallenges.has('4'),
      },
      {
        id: '5',
        emoji: '🧘',
        title: 'Meditation Moment',
        description: 'Show us your meditation setup. 10 minutes minimum required.',
        stakeAmount: 0.05,
        deadline: new Date(Date.now() + 20 * 3600 * 1000),
        participants: 52,
        prizePool: 1.2,
        joined: joinedChallenges.has('5'),
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
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const handleChallengePress = (challenge: Challenge) => {
    navigation.navigate('ChallengeDetail', { 
      challenge,
      onJoinSuccess: (challengeId: string) => {
        addJoinedChallenge(challengeId);
        loadChallenges();
      }
    });
  };

  const handleStakeBadgePress = (amount: number) => {
    setSelectedStakeAmount(amount);
    setShowStakeInfo(true);
  };

  const renderChallengeCard = ({ item }: { item: Challenge }) => (
    <TouchableOpacity 
      style={styles.challengeCard} 
      activeOpacity={0.85}
      onPress={() => handleChallengePress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.challengeTitle}>{item.emoji} {item.title}</Text>
        <TouchableOpacity 
          onPress={() => handleStakeBadgePress(item.stakeAmount)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#14F195', '#0EA97F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.stakeBadge}
          >
            <Text style={styles.stakeText}>◎ {item.stakeAmount} SOL</Text>
            <Info size={12} color="#000000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.challengeDescription}>{item.description}</Text>
      
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Users size={14} color="#666666" />
          <Text style={styles.statText}>{item.participants}</Text>
        </View>
        <View style={styles.statItem}>
          <Trophy size={14} color="#666666" />
          <Text style={styles.statText}>◎ {item.prizePool}</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color="#666666" />
          <Text style={styles.statText}>{formatTimeRemaining(item.deadline)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.joinButtonWrapper}
        onPress={() => handleChallengePress(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={item.joined ? ['#14F195', '#0EA97F'] : ['#9945FF', '#7928CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.joinButton}
        >
          <Text style={styles.joinButtonText}>
            {item.joined ? 'Joined' : 'Join'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#9945FF', '#14F195']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>S</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>SolSnap</Text>
        </View>
        
        <TouchableOpacity
          style={styles.walletButton}
          onPress={isConnected ? () => navigation.navigate('Profile') : connect}
        >
          {isConnected ? (
            <View style={styles.walletConnected}>
              <View style={styles.greenDot} />
              <View>
                <Text style={styles.walletBalance}>◎ {balance?.toFixed(3) || '0.000'}</Text>
                <Text style={styles.walletAddress}>
                  {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.connectText}>Connect Wallet</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Daily Challenges</Text>
          <Text style={styles.sectionSubtitle}>{challenges.length} active today</Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <RefreshCw size={16} color="#555555" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={challenges}
        renderItem={renderChallengeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14F195" />}
        showsVerticalScrollIndicator={false}
      />

      {/* Stake Info Modal */}
      <Modal
        visible={showStakeInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStakeInfo(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowStakeInfo(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setShowStakeInfo(false)}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.modalIcon}>
              <Info size={24} color="#14F195" />
            </View>
            
            <Text style={styles.modalTitle}>Minimum Stake Required</Text>
            <Text style={styles.modalAmount}>◎ {selectedStakeAmount} SOL</Text>
            <Text style={styles.modalDescription}>
              This is the minimum SOL amount required to participate in the challenge. 
              Your stake will be returned plus rewards if you complete the challenge successfully.
            </Text>
          </View>
        </Pressable>
      </Modal>
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
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGradient: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  walletButton: { 
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
  },
  walletConnected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14F195',
  },
  walletBalance: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#14F195',
  },
  walletAddress: { 
    color: '#555555', 
    fontSize: 10, 
    fontFamily: 'monospace',
    marginTop: 2,
  },
  connectText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
  },
  listContent: { 
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  challengeCard: { 
    backgroundColor: '#141414',
    borderRadius: 16,
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#1F1F1F',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  challengeTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    flex: 1,
  },
  stakeBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8,
  },
  stakeText: { 
    color: '#000000', 
    fontSize: 11, 
    fontWeight: 'bold' 
  },
  challengeDescription: { 
    color: '#AAAAAA', 
    fontSize: 13, 
    marginBottom: 12, 
    lineHeight: 19,
  },
  cardStats: { 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  joinButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinButton: { 
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: { 
    color: '#FFFFFF', 
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#141414',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(20, 241, 149, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#14F195',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
    textAlign: 'center',
  },
});
