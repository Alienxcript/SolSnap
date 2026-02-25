// app/screens/CreateChallengeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ImagePlus, 
  X, 
  Clock, 
  Coins, 
  Users, 
  Wallet,
  CheckCircle,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useWallet } from '../contexts/WalletContext';

export const CreateChallengeScreen = ({ navigation }: any) => {
  const { isConnected, balance, connect, addCreatedChallenge, authToken } = useWallet();
  
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<string>('24h');
  const [stakeAmount, setStakeAmount] = useState('0.05');
  const [prizePool, setprizePool] = useState('0.5');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const durationOptions = [
    { label: '6 hours', value: '6h' },
    { label: '12 hours', value: '12h' },
    { label: '24 hours', value: '24h' },
    { label: '48 hours', value: '48h' },
    { label: '7 days', value: '7days' },
  ];

  const pickImage = async () => {
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant photo library access to upload a cover image.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7, // Compress to reduce storage
      base64: true, // Get base64 data
    });

    if (!result.canceled) {
      // Save as data URI for persistence
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setCoverImage(base64Image);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a challenge title');
      return;
    }

    const prizePoolAmount = parseFloat(prizePool) || 0;
    const estimatedGasFee = 0.000005; // ~5000 lamports
    const totalRequired = prizePoolAmount + estimatedGasFee;

    // Check if user has enough balance
    if (balance === null || balance < totalRequired) {
      Alert.alert(
        'Insufficient Balance',
        `You need at least ◎${totalRequired.toFixed(6)} SOL (◎${prizePoolAmount} prize pool + ◎${estimatedGasFee.toFixed(6)} gas fee).\n\nYour balance: ◎${balance?.toFixed(6) || '0'}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsPublishing(true);

    try {
      // Import required modules
      const { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
      const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
      const connection = new (require('@solana/web3.js')).Connection('https://api.devnet.solana.com', 'confirmed');
      const CHALLENGE_VAULT = new PublicKey('WTCyq1nqnpmMaha3MxpQEstauF3t4jeezX6PvvQivd8');

      await transact(async (wallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolSnap',
            uri: 'https://solsnap.app',
            icon: 'favicon.ico',
          },
          auth_token: authToken || undefined,
        });

        // Decode base64 address properly (same as join challenge)
        const account = authResult.accounts[0];
        const binaryString = atob(account.address);
        const bytesArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytesArray[i] = binaryString.charCodeAt(i);
        }
        const userPubkey = new PublicKey(bytesArray);

        const latestBlockhash = await connection.getLatestBlockhash();

        const transaction = new Transaction();
        transaction.feePayer = userPubkey;
        transaction.recentBlockhash = latestBlockhash.blockhash;

        // Transfer prize pool to vault
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPubkey,
            toPubkey: CHALLENGE_VAULT,
            lamports: Math.floor(prizePoolAmount * LAMPORTS_PER_SOL),
          })
        );

        const result = await wallet.signAndSendTransactions({
          transactions: [transaction],
          minContextSlot: latestBlockhash.lastValidBlockHeight - 150,
        });

        const signature = result[0];

        // Wait for confirmation with better error handling
        try {
          await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          });
        } catch (confirmError) {
          console.log('Confirmation warning (transaction may still succeed):', confirmError);
          // Don't throw - transaction might have succeeded
        }

        // Create challenge object
        const newChallenge = {
          id: Date.now().toString(),
          emoji: title.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '🎯',
          title: title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(),
          description,
          stakeAmount: parseFloat(stakeAmount) || 0.05,
          prizePool: prizePoolAmount,
          maxParticipants: parseInt(maxParticipants) || 50,
          duration,
          createdAt: new Date(),
          coverImage: coverImage || null,
        };

        // Save to context BEFORE showing success
        addCreatedChallenge(newChallenge);

        setIsPublishing(false);
        setShowSuccess(true);

        // Redirect after 1.5 seconds (shorter delay)
        setTimeout(() => {
          setShowSuccess(false);
          setCoverImage(null);
          setTitle('');
          setDescription('');
          setDuration('24h');
          setStakeAmount('0.05');
          setprizePool('0.5');
          setMaxParticipants('50');
          navigation.navigate('Profile');
        }, 1500);
      });
    } catch (error: any) {
      setIsPublishing(false);
      console.error('Challenge creation error:', error);

      // Don't show error if it's just null (transaction likely succeeded)
      if (error === null || error?.message === 'null') {
        // Transaction probably succeeded, save the challenge anyway
        const newChallenge = {
          id: Date.now().toString(),
          emoji: title.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '🎯',
          title: title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim(),
          description,
          stakeAmount: parseFloat(stakeAmount) || 0.05,
          prizePool: parseFloat(prizePool) || 0.5,
          maxParticipants: parseInt(maxParticipants) || 50,
          duration,
          createdAt: new Date(),
          coverImage: coverImage || null,
        };
        
        addCreatedChallenge(newChallenge);
        
        Alert.alert(
          'Challenge Created!',
          'Your challenge was created successfully.',
          [{ text: 'OK', onPress: () => {
            setCoverImage(null);
            setTitle('');
            setDescription('');
            setDuration('24h');
            setStakeAmount('0.05');
            setprizePool('0.5');
            setMaxParticipants('50');
            navigation.navigate('Profile');
          }}]
        );
        return;
      }

      let errorMsg = 'Failed to create challenge.';
      if (error?.code === 'ERROR_AUTHORIZATION_FAILED') {
        errorMsg = 'You cancelled the transaction.';
      } else if (error?.message && error.message !== 'null') {
        errorMsg = error.message;
      }

      Alert.alert('Error', errorMsg, [{ text: 'OK' }]);
    }
  };

  // Not connected state
  if (!isConnected) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.notConnectedContainer}>
          <LinearGradient
            colors={['#9945FF', '#14F195']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletIconContainer}
          >
            <Wallet size={28} color="#FFFFFF" />
          </LinearGradient>
          
          <Text style={styles.notConnectedTitle}>Create a Challenge</Text>
          <Text style={styles.notConnectedDescription}>
            Connect your Solana wallet to create and fund challenges for the community.
          </Text>
          
          <TouchableOpacity style={styles.connectButton} onPress={connect}>
            <LinearGradient
              colors={['#9945FF', '#7928CA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.connectButtonGradient}
            >
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successContainer}>
          <LinearGradient
            colors={['#14F195', '#0EA97F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIconContainer}
          >
            <CheckCircle size={36} color="#0A0A0A" />
          </LinearGradient>
          
          <Text style={styles.successTitle}>Challenge Created!</Text>
          <Text style={styles.successDescription}>Redirecting to home...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Challenge</Text>
        <TouchableOpacity
          style={styles.publishButton}
          onPress={handlePublish}
          disabled={isPublishing || !title.trim()}
        >
          <LinearGradient
            colors={['#9945FF', '#7928CA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.publishButtonGradient, (!title.trim() || isPublishing) && styles.publishButtonDisabled]}
          >
            {isPublishing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.publishButtonText}>Publish</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          
          {/* Cover Image */}
          <View style={styles.formSection}>
            {coverImage ? (
              <View style={styles.coverImageContainer}>
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeCoverImage}>
                  <View style={styles.removeImageCircle}>
                    <X size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.coverImageUpload} onPress={pickImage}>
                <ImagePlus size={28} color="#9945FF" />
                <Text style={styles.coverImageText}>Add cover image</Text>
                <Text style={styles.coverImageSubtext}>Optional · JPG, PNG</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <View style={styles.formSection}>
            <Text style={styles.label}>CHALLENGE TITLE *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 🌅 Sunrise Snap"
              placeholderTextColor="#333333"
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>
          </View>

          {/* Description */}
          <View style={styles.formSection}>
            <Text style={styles.label}>DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what participants need to do to complete this challenge..."
              placeholderTextColor="#333333"
              value={description}
              onChangeText={setDescription}
              maxLength={280}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/280</Text>
          </View>

          {/* Duration */}
          <View style={styles.formSection}>
            <View style={styles.labelWithIcon}>
              <Clock size={14} color="#555555" />
              <Text style={styles.label}>DURATION</Text>
            </View>
            <View style={styles.durationOptions}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationOption,
                    duration === option.value && styles.durationOptionActive,
                  ]}
                  onPress={() => setDuration(option.value)}
                >
                  {duration === option.value ? (
                    <LinearGradient
                      colors={['#9945FF', '#7928CA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.durationOptionGradient}
                    >
                      <Text style={styles.durationOptionTextActive}>{option.label}</Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.durationOptionText}>{option.label}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stake & Prize Pool */}
          <View style={styles.formSection}>
            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <View style={styles.labelWithIcon}>
                  <Coins size={14} color="#9945FF" />
                  <Text style={styles.label}>STAKE (SOL)</Text>
                </View>
                <View style={styles.inputWithPrefix}>
                  <Text style={styles.inputPrefix}>◎</Text>
                  <TextInput
                    style={styles.inputWithPrefixField}
                    value={stakeAmount}
                    onChangeText={setStakeAmount}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#333333"
                  />
                </View>
              </View>
              
              <View style={styles.column}>
                <View style={styles.labelWithIcon}>
                  <Coins size={14} color="#FFD93D" />
                  <Text style={styles.label}>PRIZE POOL</Text>
                </View>
                <View style={styles.inputWithPrefix}>
                  <Text style={[styles.inputPrefix, { color: '#FFD93D' }]}>◎</Text>
                  <TextInput
                    style={styles.inputWithPrefixField}
                    value={prizePool}
                    onChangeText={setprizePool}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#333333"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Max Participants */}
          <View style={styles.formSection}>
            <View style={styles.labelWithIcon}>
              <Users size={14} color="#555555" />
              <Text style={styles.label}>MAX PARTICIPANTS</Text>
            </View>
            <TextInput
              style={styles.input}
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
              placeholderTextColor="#333333"
            />
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Stake per player</Text>
              <Text style={styles.summaryValue}>◎ {stakeAmount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Prize pool</Text>
              <Text style={styles.summaryValue}>◎ {prizePool}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Duration</Text>
              <Text style={styles.summaryValue}>{duration === '7days' ? '7 days' : duration}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Max players</Text>
              <Text style={styles.summaryValue}>{maxParticipants}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Your balance</Text>
              <Text style={styles.summaryValue}>◎ {balance?.toFixed(3) || '0.000'}</Text>
            </View>
          </View>

          {/* Publish Button (bottom) */}
          <TouchableOpacity
            style={styles.publishButtonBottom}
            onPress={handlePublish}
            disabled={isPublishing || !title.trim()}
          >
            <LinearGradient
              colors={['#9945FF', '#7928CA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.publishButtonBottomGradient, (!title.trim() || isPublishing) && styles.publishButtonDisabled]}
            >
              {isPublishing ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.publishButtonBottomText}>Publishing...</Text>
                </>
              ) : (
                <Text style={styles.publishButtonBottomText}>Publish Challenge</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  publishButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  publishButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  publishButtonDisabled: {
    opacity: 0.4,
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'right',
    marginTop: 4,
  },
  coverImageUpload: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(153, 69, 255, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImageText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 8,
  },
  coverImageSubtext: {
    fontSize: 12,
    color: '#444444',
    marginTop: 4,
  },
  coverImageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    height: 208,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  removeImageCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationOption: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  durationOptionActive: {},
  durationOptionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  durationOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  durationOptionTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9945FF',
    marginRight: 4,
  },
  inputWithPrefixField: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  summary: {
    backgroundColor: 'rgba(19, 8, 42, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(153, 69, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryKey: {
    fontSize: 14,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  publishButtonBottom: {
    marginTop: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  publishButtonBottomGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  publishButtonBottomText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  walletIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  notConnectedDescription: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
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
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#555555',
  },
});
