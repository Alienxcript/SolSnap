// app/screens/ChallengeDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { useWallet, formatSOL } from '../contexts/WalletContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  stakeAmount: number;
  deadline: Date;
  participants: number;
  prizePool: number;
}

export const ChallengeDetailScreen = ({ route, navigation }: any) => {
  const { challenge, onJoinSuccess } = route.params as { challenge: Challenge; onJoinSuccess?: (challengeId: string) => void };
  const { publicKey, isConnected, balance, authToken, connect } = useWallet();
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'SOL' | 'SEEKER'>('SOL');

  const CHALLENGE_VAULT = new PublicKey('WTCyq1nqnpmMaha3MxpQEstauF3t4jeezX6PvvQivd8');
  const connection = new (require('@solana/web3.js')).Connection('https://api.devnet.solana.com', 'confirmed');

  const handleJoinChallenge = async () => {
    if (!isConnected || !publicKey) {
      Alert.alert('Wallet Not Connected', 'Please connect your wallet first', [
        { text: 'Connect', onPress: connect },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    // Check sufficient balance
    const requiredAmount = challenge.stakeAmount;
    
    if (balance === null || balance < requiredAmount) {
      Alert.alert(
        'Insufficient Balance',
        `You need ${requiredAmount} SOL to join this challenge. Current balance: ${balance?.toFixed(4) || 0} SOL`
      );
      return;
    }

    setIsJoining(true);

    try {
      await transact(async (wallet) => {
        console.log('[1] Starting SOL transaction...');
        
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolSnap',
            uri: 'https://solsnap.app',
            icon: 'favicon.ico',
          },
          auth_token: authToken || undefined,
        });

        console.log('[2] Authorized');
        
        const userPubkey = new PublicKey(publicKey);
        
        console.log('[3] From:', userPubkey.toBase58());
        console.log('[4] To:', CHALLENGE_VAULT.toBase58());
        console.log('[5] Amount:', requiredAmount, 'SOL');

        console.log('[6] Getting blockhash...');
        const latestBlockhash = await connection.getLatestBlockhash();

        console.log('[7] Building transaction...');
        const transaction = new Transaction();
        transaction.feePayer = userPubkey;
        transaction.recentBlockhash = latestBlockhash.blockhash;
        
        // Always use SOL transfer (SEEKER is UI-only)
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: CHALLENGE_VAULT,
            lamports: Math.floor(requiredAmount * LAMPORTS_PER_SOL),
          })
        );

        console.log('[8] Sending to wallet...');
        
        const result = await wallet.signAndSendTransactions({
          transactions: [transaction],
          minContextSlot: latestBlockhash.lastValidBlockHeight - 150,
        });

        const signature = result[0];
        console.log('[9] ✅ Sent! Sig:', signature);

        await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        console.log('[10] ✅ Confirmed!');

        setHasJoined(true);
        
        if (onJoinSuccess) {
          onJoinSuccess(challenge.id);
        }
        
        Alert.alert(
          'Success! 🎉',
          `You've staked ${requiredAmount} SOL!\n\nTx: ${signature.slice(0, 8)}...`,
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

  const formatTimeRemaining = (deadline: Date): string => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Stake Required</Text>
            <Text style={styles.statValue}>{challenge.stakeAmount} SOL</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Participants</Text>
            <Text style={styles.statValue}>{challenge.participants}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Prize Pool</Text>
            <Text style={styles.statValue}>{challenge.prizePool.toFixed(2)} SOL</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Time Left</Text>
            <Text style={styles.statValueWarning}>{formatTimeRemaining(challenge.deadline)}</Text>
          </View>
        </View>

        {/* Payment Method Selector - SEEKER disabled with "Coming Soon" */}
        <View style={styles.paymentSelector}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity
              style={[styles.paymentOption, paymentMethod === 'SOL' && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod('SOL')}
            >
              <Text style={[styles.paymentOptionText, paymentMethod === 'SOL' && styles.paymentOptionTextActive]}>
                SOL
              </Text>
              {balance !== null && (
                <Text style={styles.balanceText}>{balance.toFixed(4)} available</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.paymentOption, styles.paymentOptionDisabled]}
              disabled={true}
            >
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>COMING SOON</Text>
              </View>
              <Text style={[styles.paymentOptionText, styles.paymentOptionTextDisabled]}>
                SEEKER
              </Text>
              <Text style={styles.balanceTextDisabled}>Multi-token support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>📋 Challenge Rules</Text>
          <Text style={styles.rulesText}>• Submit proof photo within the deadline</Text>
          <Text style={styles.rulesText}>• Photo will be verified by community</Text>
          <Text style={styles.rulesText}>• Winners split the prize pool equally</Text>
          <Text style={styles.rulesText}>• Failed submissions forfeit stake</Text>
        </View>

        {hasJoined ? (
          <View style={styles.joinedContainer}>
            <Text style={styles.joinedText}>✓ You've Joined This Challenge!</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => navigation.navigate('Camera', {
                challengeId: challenge.id,
                challengeTitle: challenge.title,
              })}
            >
              <Text style={styles.uploadButtonText}>📸 Upload Proof</Text>
            </TouchableOpacity>
          </View>
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
                Stake {challenge.stakeAmount} SOL & Join
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
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
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#14F195',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: '#141414',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  statLabel: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statValue: {
    color: '#14F195',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statValueWarning: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: '#141414',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    alignItems: 'center',
  },
  paymentOptionActive: {
    borderColor: '#14F195',
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
  },
  paymentOptionDisabled: {
    opacity: 0.6,
    borderColor: '#1F1F1F',
    borderStyle: 'dashed',
  },
  paymentOptionText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentOptionTextActive: {
    color: '#14F195',
  },
  paymentOptionTextDisabled: {
    color: '#666666',
  },
  balanceText: {
    color: '#666666',
    fontSize: 11,
    marginTop: 4,
  },
  balanceTextDisabled: {
    color: '#444444',
    fontSize: 10,
    marginTop: 4,
  },
  comingSoonBadge: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  rulesBox: {
    backgroundColor: '#141414',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderLeftWidth: 4,
    borderLeftColor: '#9945FF',
  },
  rulesTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rulesText: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  joinButton: {
    backgroundColor: '#14F195',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#14F195',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  joinedContainer: {
    alignItems: 'center',
  },
  joinedText: {
    color: '#14F195',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#9945FF',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#9945FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
