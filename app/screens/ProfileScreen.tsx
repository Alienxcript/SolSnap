// app/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useWallet, formatPublicKey, formatSOL } from '../contexts/WalletContext';

export const ProfileScreen = () => {
  const { publicKey, isConnected, balance, connect, disconnect } = useWallet();

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
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#1A1A1A' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#14F195' },
  walletCard: { backgroundColor: '#1A1A1A', margin: 20, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16 },
  walletInfo: { marginBottom: 12 },
  label: { fontSize: 12, color: '#888888', marginBottom: 4, textTransform: 'uppercase' },
  value: { fontSize: 16, color: '#FFFFFF' },
  valueHighlight: { fontSize: 20, color: '#14F195', fontWeight: 'bold' },
  disconnectButton: { backgroundColor: '#FF6B6B', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  disconnectButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  statsCard: { backgroundColor: '#1A1A1A', margin: 20, marginTop: 0, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: '#2A2A2A', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#14F195', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888888', textAlign: 'center' },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888888', textAlign: 'center', marginBottom: 24 },
  connectButton: { backgroundColor: '#14F195', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  connectButtonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});
