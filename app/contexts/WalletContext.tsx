// app/contexts/WalletContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// ✅ Key for storing auth token
const AUTH_TOKEN_KEY = '@solanasnap_auth_token';

interface WalletContextType {
  publicKey: string | null;
  balance: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  authToken: string | null; // ✅ Expose auth token
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null); // ✅ Store auth token

  // ✅ Load auth token on mount
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          console.log('✅ Loaded stored auth_token');
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Error loading auth token:', error);
      }
    };
    loadAuthToken();
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const pubKey = new PublicKey(publicKey);
        const lamports = await connection.getBalance(pubKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const connect = useCallback(async () => {
    setIsConnecting(true);

    try {
      await transact(async (wallet) => {
        // ✅ Pass stored auth_token to reuse session
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolanaSnap',
            uri: 'https://solanasnap.app',
            icon: 'favicon.ico',
          },
          auth_token: authToken || undefined, // ✅ Reuse if available
        });

        // ✅ Store the new/updated auth_token
        if (authResult.auth_token) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, authResult.auth_token);
          setAuthToken(authResult.auth_token);
          console.log('✅ Stored new auth_token');
        }

        if (!authResult.accounts || authResult.accounts.length === 0) {
          throw new Error('No accounts returned from wallet');
        }

        const account = authResult.accounts[0];
        
        // ✅ Decode address using atob
        const binaryString = atob(account.address);
        const bytesArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytesArray[i] = binaryString.charCodeAt(i);
        }
        
        const pubKey = new PublicKey(bytesArray);
        const base58Address = pubKey.toBase58();
        
        console.log('✅ Wallet connected:', base58Address);
        setPublicKey(base58Address);
      });
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setPublicKey(null);
    } finally {
      setIsConnecting(false);
    }
  }, [authToken]);

  const disconnect = useCallback(async () => {
    setPublicKey(null);
    setBalance(null);
    // ✅ Clear auth token on disconnect
    setAuthToken(null);
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      console.log('✅ Cleared auth_token');
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        balance,
        isConnected: publicKey !== null,
        isConnecting,
        authToken, // ✅ Expose to other components
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const formatPublicKey = (publicKey: string | null): string => {
  if (!publicKey) return '';
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
};

export const formatSOL = (amount: number | null): string => {
  if (amount === null) return '0 SOL';
  return `${amount.toFixed(4)} SOL`;
};
