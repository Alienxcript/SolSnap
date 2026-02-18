// app/contexts/WalletContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { toUint8Array } from '@solana-mobile/mobile-wallet-adapter-protocol';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

interface WalletContextType {
  publicKey: string | null;
  balance: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
    console.log('🔵 [1] Connect button pressed');
    setIsConnecting(true);

    try {
      console.log('🔵 [2] Starting transact...');
      
      await transact(async (wallet) => {
        console.log('🔵 [3] Inside transact callback, wallet object:', !!wallet);
        
        console.log('🔵 [4] Calling wallet.authorize...');
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolanaSnap',
            uri: 'https://solanasnap.app',
            icon: 'favicon.ico',
          },
        });
        
        console.log('🔵 [5] Authorization result received:', {
          accountsCount: authResult.accounts.length,
          authToken: !!authResult.auth_token,
          walletUriBase: authResult.wallet_uri_base,
        });

        if (!authResult.accounts || authResult.accounts.length === 0) {
          throw new Error('No accounts returned from wallet');
        }

        const account = authResult.accounts[0];
        console.log('🔵 [6] Raw account data:', {
          addressType: typeof account.address,
          addressLength: account.address?.length,
          label: account.label,
        });

        console.log('🔵 [7] Converting address to Uint8Array...');
        const addressBytes = toUint8Array(account.address);
        console.log('🔵 [8] Address bytes:', {
          bytesLength: addressBytes.length,
          firstBytes: Array.from(addressBytes.slice(0, 8)),
        });

        console.log('🔵 [9] Creating PublicKey from bytes...');
        const pubKey = new PublicKey(addressBytes);
        const base58Address = pubKey.toBase58();
        
        console.log('🔵 [10] ✅ Final address:', base58Address);
        console.log('🔵 [11] Setting state...');
        setPublicKey(base58Address);
        console.log('🔵 [12] State set successfully');
      });
      
      console.log('🔵 [13] ✅ Transact completed successfully');
      
    } catch (error) {
      console.error('🔴 [ERROR] Connection failed at step:', error);
      console.error('🔴 [ERROR] Full error object:', JSON.stringify(error, null, 2));
      setPublicKey(null);
    } finally {
      console.log('🔵 [14] Setting isConnecting to false');
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔵 Disconnecting wallet');
    setPublicKey(null);
    setBalance(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        balance,
        isConnected: publicKey !== null,
        isConnecting,
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
