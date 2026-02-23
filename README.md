# 📸 SolSnap

> Daily photo challenges with crypto stakes on Solana

**SolSnap** is a mobile-first social accountability app where users stake SOL on daily challenges, submit photo proof, and earn rewards for completion. Built for the Solana Mobile hackathon.

[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat&logo=solana)](https://solana.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=flat&logo=react)](https://reactnative.dev)

---

## ✨ Features

### 🔗 Blockchain Integration
- **Mobile Wallet Adapter** - Seamless Phantom/Solflare integration
- **Real SOL Transactions** - Stake and earn on Solana devnet
- **Auth Token Persistence** - One-tap transaction approvals after initial connection
- **Automatic Balance Updates** - Real-time SOL balance tracking

### 📱 User Experience
- **Challenge Feed** - Browse daily photo challenges with live countdowns
- **Camera Integration** - Capture or upload photos as proof
- **Gallery Picker** - Select existing photos from device
- **Auto-Refresh** - Joined badges update automatically when returning to home
- **Streak Tracking** - 7-day streak display to encourage consistency

### 🎨 Modern UI
- **Gradient Buttons** - Polished Solana-themed gradients (green, purple, gold)
- **Dark Theme** - Professional #0A0A0A background with depth
- **Smooth Navigation** - React Navigation with intuitive flow
- **Tab Bar Icons** - Custom minimalist line icons

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android device with Phantom or Solflare wallet
- Devnet SOL (get from [Solana Faucet](https://faucet.solana.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/Alienxcript/SolSnap.git
cd SolSnap

# Install dependencies
npm install

# Start development server
npx expo start
```

### Build APK

```bash
# Build for Android
eas build --platform android --profile preview
```

---

## 🏗️ Tech Stack

- **Frontend:** React Native (Expo 51)
- **Blockchain:** Solana Web3.js, Mobile Wallet Adapter
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Storage:** AsyncStorage (for auth tokens)
- **Camera:** Expo Camera + Image Picker
- **UI:** React Native + Expo Linear Gradient

---

## 📂 Project Structure

```
SolSnap/
├── app/
│   ├── contexts/
│   │   └── WalletContext.tsx      # Wallet connection & auth token management
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Challenge feed with gradients
│   │   ├── ProfileScreen.tsx      # User stats and wallet info
│   │   ├── ChallengeDetailScreen.tsx  # Challenge details & staking
│   │   └── CameraScreen.tsx       # Photo capture & gallery
│   └── ...
├── assets/
│   ├── icons/                     # Custom tab icons
│   ├── icon.png                   # App launcher icon
│   └── splash.png                 # Splash screen
├── App.tsx                        # Navigation setup
├── app.json                       # Expo configuration
└── package.json                   # Dependencies
```

---

## 🔑 Key Components

### WalletContext
Manages Solana wallet connection with auth token persistence for seamless UX.

```typescript
const { publicKey, balance, connect, authToken } = useWallet();
```

### Challenge Flow
1. User browses challenges on HomeScreen
2. Taps to view ChallengeDetailScreen
3. Stakes SOL to join (transaction via MWA)
4. Captures photo proof via CameraScreen
5. Submits for verification

---

## 🎯 Roadmap

### Current (v1.0 - Hackathon Demo)
- ✅ SOL staking on challenges
- ✅ Photo capture & upload
- ✅ Wallet integration
- ✅ Mock challenge data

### Future (Post-Hackathon)
- [ ] **Smart Contract** - On-chain challenge & prize pool management
- [ ] **Backend** - Photo storage (Firebase/IPFS) and verification
- [ ] **Multi-Token Support** - SEEKER token integration
- [ ] **Social Features** - Follow friends, leaderboards
- [ ] **AI Verification** - Automated photo proof validation
- [ ] **Mainnet Deploy** - Move to production with real stakes

---

## 🔐 Security Notes

- App currently uses **Solana Devnet** (test environment)
- Vault address: `WTCyq1nqnpmMaha3MxpQEstauF3t4jeezX6PvvQivd8`
- Mock data used for challenges (not on-chain yet)
- Photos stored locally (no backend in v1.0)

**⚠️ Not production-ready.** Do not use with mainnet/real funds.

---

## 🛠️ Development

### Run on Android Device

```bash
# Start dev server
npx expo start

# Scan QR code with Expo Go
# OR build development APK
eas build --platform android --profile development
```

### Common Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
eas build              # Build production APK
git push               # Deploy to GitHub (triggers EAS build)
```

---

## 🐛 Troubleshooting

### Build Fails
- Ensure all assets are committed to git
- Try `eas build --clear-cache`
- Check EAS build logs for specific errors

### Wallet Won't Connect
- Install Phantom or Solflare on device
- Ensure app has camera/storage permissions
- Check network connection (devnet access required)

### Transactions Fail
- Verify wallet has sufficient devnet SOL
- Check console logs for specific errors
- Ensure auth token is being saved correctly

---

## 📄 License

MIT License - feel free to use for learning or building!

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the blockchain infrastructure
- **Expo Team** - For the amazing development platform
- **Solana Mobile** - For Mobile Wallet Adapter
- **Seeker Phone** - For inspiring the SEEKER token integration idea

---

## 📞 Contact

**Developer:** Nova  
**GitHub:** [github.com/Alienxcript](https://github.com/Alienxcript)  
**Project:** [github.com/Alienxcript/SolSnap](https://github.com/Alienxcript/SolSnap)

---

**Built for Solana Mobile Hackathon 2026** 🚀
