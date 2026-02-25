// app/screens/ExploreScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, TrendingUp, Trophy, Users, Award, Clock } from 'lucide-react-native';

interface TrendingSnap {
  id: string;
  image: string;
  username: string;
  emoji: string;
  challengeName: string;
  stake: number;
  likes: number;
  timeAgo: string;
}

interface TopChallenge {
  id: string;
  rank: number;
  emoji: string;
  title: string;
  participants: number;
  prizePool: number;
  stake: number;
}

export const ExploreScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Mock trending snaps
  const trendingSnaps: TrendingSnap[] = [
    { id: '1', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', username: '@sol_monk', emoji: '🧘', challengeName: 'Meditation Moment', stake: 0.05, likes: 142, timeAgo: '2h ago' },
    { id: '2', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400', username: '@crypto_runner', emoji: '💪', challengeName: 'Morning Workout', stake: 0.15, likes: 98, timeAgo: '4h ago' },
    { id: '3', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', username: '@healthy_sol', emoji: '🥗', challengeName: 'Healthy Meal', stake: 0.05, likes: 76, timeAgo: '5h ago' },
  ];

  // Mock top challenges
  const topChallenges: TopChallenge[] = [
    { id: '1', rank: 1, emoji: '🧘', title: 'Meditation Moment', participants: 52, prizePool: 1.2, stake: 0.05 },
    { id: '2', rank: 2, emoji: '🥗', title: 'Healthy Meal', participants: 45, prizePool: 0.8, stake: 0.05 },
    { id: '3', rank: 3, emoji: '📚', title: 'Reading Hour', participants: 31, prizePool: 0.6, stake: 0.08 },
    { id: '4', rank: 4, emoji: '🌅', title: 'Sunrise Snap', participants: 23, prizePool: 0.5, stake: 0.1 },
    { id: '5', rank: 5, emoji: '💪', title: 'Morning Workout', participants: 18, prizePool: 0.3, stake: 0.15 },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD93D'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#444444';
    }
  };

  const filteredChallenges = searchQuery
    ? topChallenges.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
          <Search size={18} color="#555555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search challenges..."
            placeholderTextColor="#444444"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {searchQuery ? (
          // Search Results
          <View style={styles.section}>
            <Text style={styles.resultsLabel}>RESULTS ({filteredChallenges.length})</Text>
            {filteredChallenges.map((challenge) => (
              <TouchableOpacity
                key={challenge.id}
                style={styles.searchResultCard}
                onPress={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id })}
                activeOpacity={0.85}
              >
                <View style={styles.searchResultHeader}>
                  <Text style={styles.searchResultTitle}>{challenge.emoji} {challenge.title}</Text>
                  <LinearGradient
                    colors={['#14F195', '#0EA97F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.stakeBadgeSmall}
                  >
                    <Text style={styles.stakeBadgeText}>◎ {challenge.stake}</Text>
                  </LinearGradient>
                </View>
                <View style={styles.searchResultStats}>
                  <View style={styles.statItem}>
                    <Users size={14} color="#666666" />
                    <Text style={styles.statText}>{challenge.participants}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Trophy size={14} color="#666666" />
                    <Text style={styles.statText}>◎ {challenge.prizePool}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            {/* Trending SolSnaps */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={16} color="#9945FF" />
                <Text style={styles.sectionLabel}>TRENDING SOLSNAPS</Text>
              </View>
              
              {trendingSnaps.map((snap) => (
                <View
                  key={snap.id}
                  style={styles.trendingCard}
                >
                  <Image
                    source={{ uri: snap.image }}
                    style={styles.trendingImage}
                    resizeMode="cover"
                  />
                  <View style={styles.trendingInfo}>
                    <View style={styles.trendingUser}>
                      <Text style={styles.trendingEmoji}>{snap.emoji}</Text>
                      <View style={styles.trendingUserInfo}>
                        <Text style={styles.trendingUsername}>{snap.username}</Text>
                        <Text style={styles.trendingChallenge}>{snap.emoji} {snap.challengeName}</Text>
                      </View>
                      <LinearGradient
                        colors={['#9945FF', '#7928CA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.trendingStakeBadge}
                      >
                        <Text style={styles.trendingStakeText}>◎ {snap.stake}</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.trendingFooter}>
                      <View style={styles.trendingLikes}>
                        <Text style={styles.trendingLikeIcon}>⚡</Text>
                        <Text style={styles.trendingLikeCount}>{snap.likes}</Text>
                      </View>
                      <Text style={styles.trendingTime}>{snap.timeAgo}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Top Challenges */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Trophy size={16} color="#FFD93D" />
                <Text style={styles.sectionLabel}>TOP CHALLENGES</Text>
              </View>
              
              {topChallenges.map((challenge) => (
                <View
                  key={challenge.id}
                  style={styles.topChallengeCard}
                >
                  <View style={styles.rankContainer}>
                    <Text style={[styles.rankNumber, { color: getRankColor(challenge.rank) }]}>
                      {challenge.rank}
                    </Text>
                  </View>
                  
                  <View style={styles.topChallengeContent}>
                    <Text style={styles.topChallengeTitle}>{challenge.emoji} {challenge.title}</Text>
                    <View style={styles.topChallengeStats}>
                      <View style={styles.topChallengeStat}>
                        <Users size={12} color="#666666" />
                        <Text style={styles.topChallengeStatText}>{challenge.participants}</Text>
                      </View>
                      <View style={styles.topChallengeStat}>
                        <Trophy size={12} color="#666666" />
                        <Text style={styles.topChallengeStatText}>◎ {challenge.prizePool}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <LinearGradient
                    colors={['#14F195', '#0EA97F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topChallengeStakeBadge}
                  >
                    <Text style={styles.topChallengeStakeText}>◎ {challenge.stake}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </>
        )}
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
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchContainerFocused: {
    borderColor: 'rgba(153, 69, 255, 0.5)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 1.5,
  },
  resultsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  trendingCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  trendingImage: {
    width: '100%',
    height: 192,
  },
  trendingInfo: {
    padding: 12,
  },
  trendingUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendingEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  trendingUserInfo: {
    flex: 1,
  },
  trendingUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trendingChallenge: {
    fontSize: 11,
    color: '#555555',
    marginTop: 2,
  },
  trendingStakeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendingStakeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trendingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1F1F1F',
  },
  trendingLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendingLikeIcon: {
    fontSize: 14,
  },
  trendingLikeCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  trendingTime: {
    fontSize: 12,
    color: '#444444',
  },
  topChallengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  rankContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  topChallengeContent: {
    flex: 1,
  },
  topChallengeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  topChallengeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  topChallengeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topChallengeStatText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  topChallengeStakeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  topChallengeStakeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchResultCard: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#1F1F1F',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  searchResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  stakeBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stakeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchResultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
});
