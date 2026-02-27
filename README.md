# 📸 SolSnap

> Stake SOL, Complete Challenges, Earn Rewards - Mobile-First Social Accountability on Solana

**SolSnap** is a mobile accountability app where users stake SOL on daily photo challenges, submit proof, and earn rewards. Built for the **Monolith: Solana Mobile Hackathon**.

[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195?style=flat&logo=solana)](https://solana.com)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=flat&logo=react)](https://reactnative.dev)

---

## 📱 Screenshots

<div align="center">
  <img src="./screenshots/Home_screen.png" width="200" alt="Home Screen" />
  <img src="./screenshots/Challenge_detail.png" width="200" alt="Challenge Detail" />
  <img src="./screenshots/Profile_page.png" width="200" alt="Profile" />
  <img src="./screenshots/Create_challenge.png" width="200" alt="Create Challenge" />
</div>

<div align="center">
  <img src="./screenshots/Uploaf_proof.png" width="200" alt="Upload Proof" />
  <img src="./screenshots/Explore_page.png" width="200" alt="Explore" />
</div>

---

## ✨ Features

### 🔗 Blockchain Integration
- **Mobile Wallet Adapter** - Seamless Phantom/Solflare wallet integration
- **Real SOL Transactions** - Stake and earn on Solana devnet
- **Auth Token Persistence** - One-tap approvals after initial connection
- **Live Balance Updates** - Real-time SOL balance tracking
- **Challenge Vault** - Secure on-chain staking system

### 🎯 Core Functionality
- **Browse Challenges** - Daily photo challenges with live countdowns
- **Stake to Join** - Commit SOL to participate in challenges
- **Camera Integration** - Capture or upload photos as proof
- **Proof Submission** - Submit evidence for challenge completion
- **Streak Tracking** - Build consistency with daily streaks
- **Reward Distribution** - Earn SOL for successful completions

### 🎨 Modern UI/UX
- **Dark Theme** - Professional #0A0A0A background with vibrant accents
- **Gradient Design** - Solana-themed gradients (green, purple, gold, red)
- **Custom Modals** - Beautiful error and success notifications
- **Smooth Navigation** - Intuitive 4-tab bottom navigation
- **Real-time Updates** - Auto-refresh on focus and state changes
- **Persistent State** - Wallet and data persist across app restarts

### 📊 Profile Features
- **Wallet Card** - Balance display with gradient avatar
- **Stats Grid** - Current streak, completed challenges, total earned, longest streak
- **Joined Challenges** - Track active challenges with proof status
- **Created Challenges** - Manage your own challenges with cover images
- **Proof Tracking** - Visual indicators for submitted vs pending proofs

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** or **yarn**
- **Android device** with Phantom or Solflare wallet
- **Devnet SOL** - Get free test SOL from [Solana Faucet](https://faucet.solana.com)

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

### Run on Device

**Option 1: Development Build (Recommended)**
```bash
# Build and install development client
npx expo run:android
```

**Option 2: EAS Build**
```bash
# Build preview APK
npx eas build --platform android --profile preview

# Download and install APK from EAS dashboard
```

**Option 3: Expo Go (Limited - no MWA support)**
```bash
npx expo start
# Scan QR code with Expo Go app
```

---

## 🏗️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo SDK 51** - Development platform and tooling
- **TypeScript** - Type-safe development
- **React Navigation** - Stack and tab navigation
- **Lucide React Native** - Modern icon library

### Blockchain
- **Solana Web3.js** - Solana blockchain interaction
- **Mobile Wallet Adapter** - Mobile wallet connection protocol
- **@solana-mobile/mobile-wallet-adapter-protocol-web3js** - MWA implementation

### Storage & Media
- **AsyncStorage** - Local data persistence
- **Expo Camera** - Camera access and photo capture
- **Expo Image Picker** - Gallery and media library access

### UI/Styling
- **Expo Linear Gradient** - Gradient components
- **React Native StyleSheet** - Component styling
- **Custom Modals** - Hand-crafted error/success dialogs

---

## 📂 Project Structure

```
SolSnap/
├── app/
│   ├── contexts/
│   │   └── WalletContext.tsx          # Wallet state, auth tokens, joined/created challenges
│   ├── screens/
│   │   ├── HomeScreen.tsx             # Daily challenges feed with stake badges
│   │   ├── ExploreScreen.tsx          # Trending snaps and top challenges
│   │   ├── CreateChallengeScreen.tsx  # Challenge creation with cover images
│   │   ├── ProfileScreen.tsx          # User stats, wallet, and challenge management
│   │   ├── CameraScreen.tsx           # Photo capture and proof submission
│   │   └── ChallengeDetailScreen.tsx  # Challenge details, rules, and staking
│   └── ...
├── assets/
│   ├── icon.png                       # App launcher icon
│   ├── splash.png                     # Splash screen
│   └── adaptive-icon.png              # Adaptive icon (Android)
├── screenshots/                       # App screenshots for README
├── App.tsx                           # Root navigation setup
├── app.json                          # Expo configuration
├── eas.json                          # EAS Build configuration
└── package.json                      # Dependencies
```

---

## 🔑 Key Components

### WalletContext
Global wallet state management with persistence:
```typescript
const { 
  publicKey,           // User's wallet address
  balance,             // SOL balance
  isConnected,         // Connection status
  authToken,           // MWA auth token
  joinedChallenges,    // Set of joined challenge IDs
  createdChallenges,   // Array of user-created challenges
  proofSubmitted,      // Set of challenges with submitted proofs
  connect,             // Connect wallet function
  disconnect,          // Disconnect function
  addJoinedChallenge,  // Mark challenge as joined
  markProofSubmitted,  // Mark proof as submitted
  addCreatedChallenge  // Add new created challenge
} = useWallet();
```

### Challenge Flow
1. **Browse** - User views challenges on HomeScreen
2. **View Details** - Tap to see ChallengeDetailScreen with rules
3. **Stake SOL** - User stakes required amount via Mobile Wallet Adapter
4. **Join Success** - Challenge marked as joined, badge updates
5. **Capture Proof** - User opens CameraScreen from Profile
6. **Submit** - Photo submitted, proof status updated
7. **Earn Rewards** - Automatic distribution (future implementation)

### Transaction Flow
```
User taps "Join" 
  → Check wallet connected 
  → Check sufficient balance 
  → Create transaction (SystemProgram.transfer) 
  → Sign via MWA (Phantom/Solflare)
  → Confirm on-chain 
  → Update local state 
  → Show success modal
```

---

## 🎯 Features Breakdown

### ✅ Implemented (v1.0)
- ✅ Mobile Wallet Adapter integration (Phantom, Solflare)
- ✅ SOL staking transactions on devnet
- ✅ Auth token persistence for seamless UX
- ✅ Photo capture and gallery selection
- ✅ Challenge creation with cover images
- ✅ Profile stats (streak, completed, earned)
- ✅ Joined/created challenge tracking
- ✅ Proof submission status tracking
- ✅ Custom error/success modals
- ✅ Input validation and error handling
- ✅ Persistent state across app restarts
- ✅ Real-time balance updates

### 🚧 In Progress
- 🚧 Smart contract for on-chain challenge management
- 🚧 Backend API for photo storage
- 🚧 Proof verification system

### 📋 Roadmap (Post-Hackathon)
- [ ] **Smart Contracts** - On-chain challenge registry and prize pools
- [ ] **Backend Infrastructure** - Photo storage (IPFS/Firebase)
- [ ] **AI Verification** - Automated proof validation
- [ ] **Social Features** - Follow users, leaderboards, comments
- [ ] **Multi-Token Support** - SEEKER token integration
- [ ] **Push Notifications** - Reminders for challenges and deadlines
- [ ] **Mainnet Deployment** - Production launch with real stakes
- [ ] **iOS Support** - Apple App Store release

---

## 🔐 Security & Configuration

### Devnet Configuration
- **Network:** Solana Devnet
- **RPC:** https://api.devnet.solana.com
- **Challenge Vault:** `WTCyq1nqnpmMaha3MxpQEstauF3t4jeezX6PvvQivd8`

### Data Storage
- **Wallet State:** AsyncStorage (local)
- **Auth Token:** Encrypted in AsyncStorage
- **Photos:** Base64 encoded in AsyncStorage (v1.0)
- **Challenges:** Mock data (on-chain in v2.0)

### ⚠️ Important Notes
- **NOT PRODUCTION-READY** - Use devnet only
- **DO NOT USE WITH MAINNET** - Test environment only
- **Mock Data** - Challenges are not yet on-chain
- **Local Storage** - Photos stored locally, not uploaded

---

## 🛠️ Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on connected Android device
npx expo run:android
```

### Build Commands

```bash
# Development build (fastest for testing)
npx expo run:android

# Preview APK (shareable)
npx eas build --platform android --profile preview

# Production APK (for release)
npx eas build --platform android --profile production
```

### Environment Setup

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure project:**
   ```bash
   eas build:configure
   ```

### Testing

```bash
# Run on Android emulator
npx expo run:android

# Run on physical device
# 1. Enable USB debugging on device
# 2. Connect via USB
# 3. Run: npx expo run:android
```

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
eas build --clear-cache --platform android --profile preview

# Check build logs
eas build:list
eas build:view <BUILD_ID>
```

### Wallet Connection Issues
- Ensure Phantom or Solflare is installed on device
- Check device has internet connection
- Verify app has camera and storage permissions
- Try disconnecting and reconnecting wallet

### Transaction Failures
- Confirm wallet has sufficient devnet SOL
- Check console logs for specific errors
- Verify RPC endpoint is accessible
- Try again after a few seconds (network issues)

### App Crashes
- Check device logs: `adb logcat | grep ReactNative`
- Ensure all dependencies are installed: `npm install`
- Clear Metro cache: `npx expo start --clear`
- Reinstall app on device

---

## 📄 License

MIT License - Free to use for learning and building!

---

## 🙏 Acknowledgments

- **Solana Foundation** - Blockchain infrastructure and grants
- **Expo Team** - Incredible mobile development platform
- **Solana Mobile** - Mobile Wallet Adapter protocol
- **Monolith Hackathon** - Inspiration and opportunity
- **Phantom & Solflare** - Mobile wallet implementations

---

## 👥 Developers

Built by:

- **[Alienxcript](https://github.com/Alienxcript)** 
- **[EndLes5](https://github.com/EndLes5)**

---

## 📞 Contact & Links
 
- **X** : [Nova](https://x.com/Novachrome_x377)
- **GitHub:** [github.com/Alienxcript/SolSnap](https://github.com/Alienxcript/SolSnap)
- **Demo Video:** Coming soon
- **Hackathon:** Monolith: Solana Mobile Hackathon 2026

---

## 🌟 Support the Project

If you find SolSnap useful:
- ⭐ Star the repository
- 🐛 Report bugs via Issues
- 💡 Suggest features via Discussions
- 🤝 Contribute via Pull Requests

---

**Built for Monolith: Solana Mobile Hackathon 2026** 🚀

*Stake. Snap. Earn. Repeat.*
