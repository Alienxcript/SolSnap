// app/screens/ChallengeDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useWallet, formatSOL } from '../contexts/WalletContext';
import { 
  PublicKey, 
  Connection,
  clusterApiUrl,
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Transaction,
} from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

interface Challenge {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  participants: number;
  prizePool: number;
  imageUrl?: string;
  longDescription?: string;
  rules?: string[];
}

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// ✅ FIX: Dedicated Challenge Vault address
// Replace this with your program's PDA when smart contract is ready
const CHALLENGE_VAULT = new PublicKey('WTCyq1nqnpmMaha3MxpQEstauF3t4jeezX6PvvQivd8');

export const ChallengeDetailScreen = ({ route, navigation }: any) => {
  const { challenge, onJoinSuccess } = route.params as { challenge: Challenge; onJoinSuccess?: (challengeId: string) => void };
  const { publicKey, isConnected, balance, connect } = useWallet();
  
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(challenge.deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [challenge.deadline]);

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const handleJoinChallenge = async () => {
    if (!isConnected || !publicKey) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet first', [
        { text: 'Connect', onPress: connect },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (balance === null || balance < challenge.stakeAmount) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${challenge.stakeAmount} SOL to join this challenge. Current balance: ${formatSOL(balance)}`
      );
      return;
    }

    setIsJoining(true);

    try {
      // ✅ Use publicKey from context directly (already connected)
      const userPubkey = new PublicKey(publicKey);
      
      console.log('[1] Using existing session');
      console.log('[2] From:', userPubkey.toBase58());
      console.log('[3] To:', CHALLENGE_VAULT.toBase58());
      console.log('[4] Amount:', challenge.stakeAmount, 'SOL');

      await transact(async (wallet) => {
        console.log('[5] Getting blockhash...');
        const latestBlockhash = await connection.getLatestBlockhash();

        console.log('[6] Building transaction...');
        const transaction = new Transaction();
        transaction.feePayer = userPubkey;
        transaction.recentBlockhash = latestBlockhash.blockhash;
        
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: CHALLENGE_VAULT,
            lamports: Math.floor(challenge.stakeAmount * LAMPORTS_PER_SOL),
          })
        );

        console.log('[7] Sending to wallet...');
        
        // ✅ No authorize() call - use existing session
        const result = await wallet.signAndSendTransactions({
          transactions: [transaction],
          minContextSlot: latestBlockhash.lastValidBlockHeight - 150,
        });

        const signature = result[0];
        console.log('[8] ✅ Sent! Sig:', signature);

        // Confirm
        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        console.log('[9] ✅ Confirmed!');

        setHasJoined(true);
        
        // ✅ Notify parent that user joined this challenge
        if (onJoinSuccess) {
          onJoinSuccess(challenge.id);
        }
        
        Alert.alert(
          'Success! 🎉',
          `You've staked ${challenge.stakeAmount} SOL!\n\nTx: ${signature.slice(0, 8)}...`,
          [{ text: 'OK' }]
        );
      });

    } catch (error: any) {
      console.error('[ERROR]:', error);
      
      let msg = 'Transaction failed.';
      if (error?.code === 'ERROR_AUTHORIZATION_FAILED') {
        msg = 'You cancelled the transaction.';
      } else if (error?.message) {
        msg = error.message;
      }
      
      Alert.alert('Failed', msg, [{ text: 'OK' }]);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenge Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Challenge Hero */}
        <View style={styles.hero}>
          <Text style={styles.challengeEmoji}>{challenge.title.split(' ')[0]}</Text>
          <Text style={styles.challengeTitle}>{challenge.title.split(' ').slice(1).join(' ')}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
        </View>

        {/* Stake Info Card */}
        <View style={styles.stakeCard}>
          <View style={styles.stakeRow}>
            <Text style={styles.stakeLabel}>Stake Required</Text>
            <Text style={styles.stakeAmount}>{challenge.stakeAmount} SOL</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stakeRow}>
            <Text style={styles.stakeLabel}>Prize Pool</Text>
            <Text style={styles.prizeAmount}>{challenge.prizePool.toFixed(2)} SOL</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{challenge.participants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{timeRemaining}</Text>
            <Text style={styles.statLabel}>Time Left</Text>
          </View>
        </View>

        {/* Long Description */}
        {challenge.longDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Challenge</Text>
            <Text style={styles.sectionText}>{challenge.longDescription}</Text>
          </View>
        )}

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {(challenge.rules || [
            'Complete the challenge before the deadline',
            'Upload clear photo proof',
            'Must be original content (no reposting)',
            'Complete to get your stake back + share of forfeits',
          ]).map((rule, index) => (
            <View key={index} style={styles.ruleItem}>
              <Text style={styles.ruleBullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>

        {/* Wallet Info */}
        {isConnected && (
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Your Balance</Text>
            <Text style={styles.walletBalance}>{formatSOL(balance)}</Text>
          </View>
        )}

        {/* Spacer for button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Join Button (Fixed at bottom) */}
      <View style={styles.footer}>
        {!isConnected ? (
          <TouchableOpacity style={styles.connectButton} onPress={connect}>
            <Text style={styles.connectButtonText}>Connect Wallet to Join</Text>
          </TouchableOpacity>
        ) : hasJoined ? (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => navigation.navigate('Camera', { 
              challengeId: challenge.id,
              challengeTitle: challenge.title 
            })}
          >
            <Text style={styles.uploadButtonText}>📸 Upload Proof</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, isJoining && styles.joinButtonDisabled]}
            onPress={handleJoinChallenge}
            disabled={isJoining}
          >
            {isJoining ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.joinButtonText}>
                Stake {challenge.stakeAmount} SOL & Join Challenge
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    color: '#14F195',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  hero: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  challengeEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  challengeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  challengeDescription: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  stakeCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#14F195',
  },
  stakeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stakeLabel: {
    fontSize: 14,
    color: '#888888',
    textTransform: 'uppercase',
  },
  stakeAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14F195',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },
  prizeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14F195',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    textTransform: 'uppercase',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 16,
    color: '#AAAAAA',
    lineHeight: 24,
  },
  ruleItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ruleBullet: {
    color: '#14F195',
    fontSize: 20,
    marginRight: 12,
    marginTop: -4,
  },
  ruleText: {
    flex: 1,
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  walletInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
  },
  walletLabel: {
    fontSize: 14,
    color: '#888888',
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14F195',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  connectButton: {
    backgroundColor: '#14F195',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#14F195',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
