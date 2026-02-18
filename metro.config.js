const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .mjs files
config.resolver.sourceExts.push('mjs');

// Handle crypto and other polyfills needed for Solana MWA
config.resolver.extraNodeModules = {
  crypto: require.resolve('expo-crypto'),
  stream: require.resolve('readable-stream'),
  buffer: require.resolve('buffer'),
  url: require.resolve('react-native-url-polyfill'),
  // Add text-encoding for TextEncoder/TextDecoder
  'text-encoding': require.resolve('text-encoding'),
};

module.exports = config;
