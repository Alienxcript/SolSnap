// app/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useWallet, formatPublicKey, formatSOL } from '../contexts/WalletContext';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface JoinedChallenge {
  id: string;
  title: string;
  stakeAmount: number;
  deadline: Date;
  status: 'active' | 'pending' | 'completed';
  proofSubmitted: boolean;
}

export const ProfileScreen = ({ navigation }: any) => {
  const { publicKey, isConnected, balance, connect, disconnect } = useWallet();
  const [joinedChallenges, setJoinedChallenges] = useState<JoinedChallenge[]>([]);

  // Load joined challenges
  const loadJoinedChallenges = () => {
    // Mock data - in production, fetch from backend/blockchain
    const mockJoined: JoinedChallenge[] = [
      {
        id: '1',
        title: '🌅 Sunrise Snap',
        stakeAmount: 0.1,
        deadline: new Date(Date.now() + 8 * 3600 * 1000),
        status: 'active',
        proofSubmitted: false,
      },
      {
        id: '2',
        title: '🥗 Healthy Meal',
        stakeAmount: 0.05,
        deadline: new Date(Date.now() + 12 * 3600 * 1000),
        status: 'active',
        proofSubmitted: true,
      },
    ];
    setJoinedChallenges(mockJoined);
  };

  useEffect(() => {
    if (isConnected) {
      loadJoinedChallenges();
    }
  }, [isConnected]);

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (isConnected) {
        loadJoinedChallenges();
      }
    }, [isConnected])
  );

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#14F195';
      case 'pending': return '#FFD93D';
      case 'completed': return '#9945FF';
      default: return '#666666';
    }
  };

  const getStatusText = (challenge: JoinedChallenge) => {
    if (challenge.proofSubmitted) {
      return '✓ Submitted';
    }
    if (challenge.status === 'active') {
      return 'Needs Proof';
    }
    return challenge.status;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {isConnected ? (
          <>
            <View style={styles.walletCard}>
              <Text style={styles.sectionTitle}>Wallet</Text>
              <View style={styles.walletInfo}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{formatPublicKey(publicKey)}</Text>
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.label}>Balance</Text>
                <Text style={styles.valueHighlight}>{formatSOL(balance)}</Text>
              </View>
              <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
                <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsCard}>
              <Text style={styles.sectionTitle}>Stats</Text>
              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>7</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>23</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
              <View style={styles.statRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>2.5 SOL</Text>
                  <Text style={styles.statLabel}>Total Earned</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
              </View>
            </View>

            {/* Joined Challenges Section */}
            <View style={styles.joinedSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Challenges</Text>
                <View style={styles.challengeCount}>
                  <Text style={styles.challengeCountText}>{joinedChallenges.length}</Text>
                </View>
              </View>

              {joinedChallenges.length > 0 ? (
                joinedChallenges.map((challenge) => (
                  <TouchableOpacity
                    key={challenge.id}
                    style={styles.challengeCard}
                    onPress={() => navigation.navigate('Home', {
                      screen: 'HomeMain',
                      params: { highlightChallenge: challenge.id }
                    })}
                    activeOpacity={0.85}
                  >
                    <View style={styles.challengeHeader}>
                      <Text style={styles.challengeTitle}>{challenge.title}</Text>
                      <LinearGradient
                        colors={['#14F195', '#0EA97F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.stakeBadge}
                      >
                        <Text style={styles.stakeText}>{challenge.stakeAmount} SOL</Text>
                      </LinearGradient>
                    </View>

                    <View style={styles.challengeInfo}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Time Left</Text>
                        <Text style={styles.infoValue}>
                          {formatTimeRemaining(challenge.deadline)}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <View style={[styles.statusBadge, { 
                          backgroundColor: challenge.proofSubmitted ? 'rgba(20, 241, 149, 0.15)' : 'rgba(255, 107, 107, 0.15)'
                        }]}>
                          <Text style={[styles.statusText, { 
                            color: challenge.proofSubmitted ? '#14F195' : '#FF6B6B'
                          }]}>
                            {getStatusText(challenge)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {!challenge.proofSubmitted && (
                      <TouchableOpacity
                        style={styles.uploadProofButton}
                        onPress={() => navigation.navigate('Camera', {
                          challengeId: challenge.id,
                          challengeTitle: challenge.title,
                        })}
                      >
                        <Text style={styles.uploadProofText}>📸 Upload Proof</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyChallenges}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No Challenges Yet</Text>
                  <Text style={styles.emptyText}>Join your first challenge to start earning!</Text>
                  <TouchableOpacity 
                    style={styles.browseChallengesButton}
                    onPress={() => navigation.navigate('Home')}
                  >
                    <Text style={styles.browseChallengesText}>Browse Challenges</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👛</Text>
            <Text style={styles.emptyTitle}>No Wallet Connected</Text>
            <Text style={styles.emptyText}>Connect your wallet to view your profile</Text>
            <TouchableOpacity style={styles.connectButton} onPress={connect}>
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
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
    backgroundColor: '#0A0A0A' 
  },
  header: { 
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
  walletCard: { 
    backgroundColor: '#141414', 
    margin: 20, 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#1F1F1F' 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 16 
  },
  walletInfo: { 
    marginBottom: 12 
  },
  label: { 
    fontSize: 12, 
    color: '#666666', 
    marginBottom: 4, 
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  value: { 
    fontSize: 16, 
    color: '#FFFFFF',
    fontWeight: '500',
  },
  valueHighlight: { 
    fontSize: 20, 
    color: '#14F195', 
    fontWeight: 'bold' 
  },
  disconnectButton: { 
    backgroundColor: '#FF6B6B', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 16,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disconnectButtonText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontWeight: '700' 
  },
  statsCard: { 
    backgroundColor: '#141414', 
    margin: 20, 
    marginTop: 0, 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#1F1F1F' 
  },
  statRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
  },
  statBox: { 
    flex: 1, 
    backgroundColor: '#1F1F1F', 
    padding: 16, 
    borderRadius: 12, 
    marginHorizontal: 4, 
    alignItems: 'center' 
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#14F195', 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 11, 
    color: '#666666', 
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  joinedSection: {
    backgroundColor: '#141414',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeCount: {
    backgroundColor: '#14F195',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  challengeCountText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  stakeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  challengeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    color: '#AAAAAA',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  uploadProofButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadProofText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyChallenges: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyState: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 40, 
    marginTop: 60 
  },
  emptyEmoji: { 
    fontSize: 48, 
    marginBottom: 12 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: 13, 
    color: '#666666', 
    textAlign: 'center', 
    marginBottom: 20,
    lineHeight: 20,
  },
  browseChallengesButton: {
    backgroundColor: '#14F195',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseChallengesText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectButton: { 
    backgroundColor: '#14F195', 
    paddingHorizontal: 32, 
    paddingVertical: 14, 
    borderRadius: 12,
    shadowColor: '#14F195',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  connectButtonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});
