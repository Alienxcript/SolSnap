// app/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useWallet, formatPublicKey } from '../contexts/WalletContext';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, Flame, CheckCircle, Trophy, TrendingUp, Clock, Camera } from 'lucide-react-native';

interface JoinedChallenge {
  id: string;
  emoji: string;
  title: string;
  stakeAmount: number;
  deadline: Date;
  status: 'active' | 'pending' | 'completed';
  proofSubmitted: boolean;
}

interface CreatedChallenge {
  id: string;
  title: string;
  stakeAmount: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  deadline: Date;
  status: 'active' | 'ended';
}

export const ProfileScreen = ({ navigation }: any) => {
  const { publicKey, isConnected, balance, connect, disconnect, joinedChallenges } = useWallet();
  const [createdChallenges, setCreatedChallenges] = useState<CreatedChallenge[]>([]);

  // All available challenges (should match HomeScreen)
  const allChallenges: JoinedChallenge[] = [
    {
      id: '1',
      emoji: '🌅',
      title: 'Sunrise Snap',
      stakeAmount: 0.1,
      deadline: new Date(Date.now() + 8 * 3600 * 1000),
      status: 'active',
      proofSubmitted: false,
    },
    {
      id: '2',
      emoji: '🥗',
      title: 'Healthy Meal',
      stakeAmount: 0.05,
      deadline: new Date(Date.now() + 12 * 3600 * 1000),
      status: 'active',
      proofSubmitted: false,
    },
    {
      id: '3',
      emoji: '💪',
      title: 'Morning Workout',
      stakeAmount: 0.15,
      deadline: new Date(Date.now() + 10 * 3600 * 1000),
      status: 'active',
      proofSubmitted: false,
    },
    {
      id: '4',
      emoji: '📚',
      title: 'Reading Hour',
      stakeAmount: 0.08,
      deadline: new Date(Date.now() + 16 * 3600 * 1000),
      status: 'active',
      proofSubmitted: false,
    },
    {
      id: '5',
      emoji: '🧘',
      title: 'Meditation Moment',
      stakeAmount: 0.05,
      deadline: new Date(Date.now() + 20 * 3600 * 1000),
      status: 'active',
      proofSubmitted: false,
    },
  ];

  // Filter to only show joined challenges
  const userJoinedChallenges = allChallenges.filter(c => joinedChallenges.has(c.id));

  const loadCreatedChallenges = () => {
    const mockCreated: CreatedChallenge[] = [];
    setCreatedChallenges(mockCreated);
  };

  useEffect(() => {
    if (isConnected) {
      loadCreatedChallenges();
    }
  }, [isConnected]);

  useFocusEffect(
    React.useCallback(() => {
      if (isConnected) {
        loadCreatedChallenges();
      }
    }, [isConnected, joinedChallenges])
  );

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isConnected ? (
          <>
            {/* Wallet Card */}
            <View style={styles.walletCard}>
              <View style={styles.walletTop}>
                <View style={styles.walletLeft}>
                  <LinearGradient
                    colors={['#9945FF', '#14F195']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.walletAvatar}
                  >
                    <Text style={styles.walletAvatarText}>◎</Text>
                  </LinearGradient>
                  <View>
                    <Text style={styles.walletName}>Wallet</Text>
                    <Text style={styles.walletAddress}>{formatPublicKey(publicKey)}</Text>
                  </View>
                </View>
                <View style={styles.greenDot} />
              </View>
              
              <View style={styles.walletBalance}>
                <Text style={styles.balanceLabel}>BALANCE</Text>
                <Text style={styles.balanceValue}>◎ {balance?.toFixed(3) || '0.000'}</Text>
              </View>

              <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
                <LogOut size={16} color="#FF6B6B" />
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, styles.statBoxOrange]}>
                <Flame size={20} color="#FF8C00" />
                <Text style={styles.statValue}>7</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>

              <View style={[styles.statBox, styles.statBoxGreen]}>
                <CheckCircle size={20} color="#14F195" />
                <Text style={styles.statValue}>23</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>

              <View style={[styles.statBox, styles.statBoxGold]}>
                <Trophy size={20} color="#FFD93D" />
                <Text style={styles.statValue}>◎ 2.5</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>

              <View style={[styles.statBox, styles.statBoxPurple]}>
                <TrendingUp size={20} color="#9945FF" />
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>
            </View>

            {/* Joined Challenges */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>JOINED CHALLENGES</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{userJoinedChallenges.length}</Text>
                </View>
              </View>

              {userJoinedChallenges.length > 0 ? (
                userJoinedChallenges.map((challenge) => (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <Text style={styles.challengeTitle}>{challenge.emoji} {challenge.title}</Text>
                    <View style={styles.stakeBadge}>
                      <Text style={styles.stakeBadgeText}>◎ {challenge.stakeAmount} SOL</Text>
                    </View>
                  </View>

                  <View style={styles.challengeInfo}>
                    <View style={styles.challengeInfoItem}>
                      <Clock size={14} color="#666666" />
                      <Text style={styles.challengeInfoText}>{formatTimeRemaining(challenge.deadline)}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>Needs Proof</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => navigation.navigate('Camera', {
                      challengeId: challenge.id,
                      challengeTitle: challenge.title,
                    })}
                  >
                    <LinearGradient
                      colors={['#14F195', '#0EA97F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.uploadButtonGradient}
                    >
                      <Camera size={16} color="#000000" />
                      <Text style={styles.uploadButtonText}>Upload Proof</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIconText}>🎯</Text>
                  <Text style={styles.emptyTitle}>No challenges joined yet</Text>
                  <Text style={styles.emptyDescription}>Join a challenge from the Home tab!</Text>
                </View>
              )}
            </View>

            {/* Created Challenges */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>CREATED CHALLENGES</Text>
                <TouchableOpacity 
                  style={styles.newButton}
                  onPress={() => navigation.navigate('Create')}
                >
                  <Text style={styles.newButtonText}>+ New</Text>
                </TouchableOpacity>
              </View>

              {createdChallenges.length > 0 ? (
                createdChallenges.map((challenge) => (
                  <View key={challenge.id} style={styles.challengeCard}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Text style={styles.emptyIconText}>+</Text>
                  </View>
                  <Text style={styles.emptyTitle}>No challenges created yet</Text>
                  <Text style={styles.emptyDescription}>Be the first to launch a challenge!</Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('Create')}
                  >
                    <LinearGradient
                      colors={['#9945FF', '#7928CA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.createButtonGradient}
                    >
                      <Text style={styles.createButtonText}>Create Challenge</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.notConnectedContainer}>
            <Text style={styles.notConnectedEmoji}>👛</Text>
            <Text style={styles.notConnectedTitle}>No Wallet Connected</Text>
            <Text style={styles.notConnectedDescription}>Connect your wallet to view your profile</Text>
            <TouchableOpacity style={styles.connectButton} onPress={connect}>
              <LinearGradient
                colors={['#14F195', '#0EA97F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.connectButtonGradient}
              >
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flex: 1,
  },
  walletCard: {
    backgroundColor: 'rgba(25, 15, 50, 0.4)',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  walletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  walletAddress: {
    fontSize: 12,
    color: '#555555',
    fontFamily: 'monospace',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14F195',
  },
  walletBalance: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  disconnectText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statBox: {
    width: '47%', // Force 2 columns
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  statBoxOrange: {
    backgroundColor: 'rgba(26, 14, 0, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
  statBoxGreen: {
    backgroundColor: 'rgba(0, 26, 14, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(20, 241, 149, 0.2)',
  },
  statBoxGold: {
    backgroundColor: 'rgba(26, 20, 0, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 217, 61, 0.2)',
  },
  statBoxPurple: {
    backgroundColor: 'rgba(19, 8, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 1.5,
  },
  countBadge: {
    backgroundColor: '#14F195',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  newButton: {
    backgroundColor: '#9945FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  challengeCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  stakeBadge: {
    backgroundColor: '#14F195',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stakeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  challengeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  challengeInfoText: {
    fontSize: 13,
    color: '#666666',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  uploadButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  emptyState: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#9945FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 20,
  },
  createButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  createButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  notConnectedEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  notConnectedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notConnectedDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  connectButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});
