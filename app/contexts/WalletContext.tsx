// app/contexts/WalletContext.tsx
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

interface WalletState {
  publicKey: PublicKey | null;
  isConnected: boolean;
  balance: number | null;
  isConnecting: boolean;
}

type WalletAction =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; publicKey: PublicKey; balance: number }
  | { type: 'DISCONNECTED' }
  | { type: 'ERROR' };

const initialState: WalletState = {
  publicKey: null,
  isConnected: false,
  balance: null,
  isConnecting: false,
};

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'CONNECTING':
      return { ...state, isConnecting: true };
    case 'CONNECTED':
      return {
        publicKey: action.publicKey,
        balance: action.balance,
        isConnected: true,
        isConnecting: false,
      };
    case 'DISCONNECTED':
      return initialState;
    case 'ERROR':
      return { ...initialState, isConnecting: false };
    default:
      return state;
  }
}

interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connect = useCallback(async () => {
    dispatch({ type: 'CONNECTING' });
    
    try {
      await transact(async (wallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'SolanaSnap',
            uri: 'https://solanasnap.app',
            icon: 'favicon.ico',
          },
        });

        const pubKey = new PublicKey(authResult.accounts[0].address);
        const bal = await connection.getBalance(pubKey);
        
        // Dispatch AFTER getting all data
        setTimeout(() => {
          dispatch({ 
            type: 'CONNECTED', 
            publicKey: pubKey, 
            balance: bal / 1e9 
          });
        }, 100);
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      dispatch({ type: 'ERROR' });
    }
  }, []);

  const disconnect = useCallback(() => {
    dispatch({ type: 'DISCONNECTED' });
  }, []);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect }}>
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

export const formatPublicKey = (publicKey: PublicKey | null): string => {
  if (!publicKey) return '';
  const key = publicKey.toBase58();
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

export const formatSOL = (amount: number | null): string => {
  if (amount === null) return '0 SOL';
  return `${amount.toFixed(4)} SOL`;
};
