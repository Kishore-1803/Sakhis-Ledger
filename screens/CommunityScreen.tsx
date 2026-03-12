import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TranslatedText } from '../components/TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Colors, MONTHLY_INCOME } from '../constants/theme';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isIcon?: boolean;
  finHealth: number;
  savings: number;
}

const MOCK_SHG_MEMBERS: GroupMember[] = [
  { id: 'm1', name: 'Lakshmi', avatar: 'user', finHealth: 72, savings: 4500, isIcon: true },
  { id: 'm2', name: 'Meena', avatar: 'user-check', finHealth: 58, savings: 2200, isIcon: true },
  { id: 'm3', name: 'Priya', avatar: 'user-plus', finHealth: 85, savings: 6800, isIcon: true },
  { id: 'm4', name: 'Anita', avatar: 'user', finHealth: 44, savings: 1000, isIcon: true },
  { id: 'm5', name: 'Sunita', avatar: 'users', finHealth: 65, savings: 3500, isIcon: true },
];

const COMMUNITY_TIPS = [
  { emoji: '🤝', title: 'SHG Power', text: 'Self-Help Groups pool savings and provide low-interest loans to members in need.' },
  { emoji: '💪', title: 'Collective Bargaining', text: 'When your SHG buys in bulk, everyone saves 20-30% on essentials.' },
  { emoji: '📚', title: 'Share Knowledge', text: 'Discuss financial scenarios with your group. Different perspectives lead to better decisions!' },
  { emoji: '🏦', title: 'Group Savings Goal', text: 'Set a monthly group savings target. Peer accountability helps everyone save more.' },
];

export default function CommunityScreen() {
  const user = useSelector((state: RootState) => state.user);
  const sim = useSelector((state: RootState) => state.simulation);
  const [selectedTip, setSelectedTip] = useState(0);

  const groupTotal = MOCK_SHG_MEMBERS.reduce((sum, m) => sum + m.savings, 0) + sim.jars.savings;
  const groupAvgHealth = Math.round(
    (MOCK_SHG_MEMBERS.reduce((sum, m) => sum + m.finHealth, 0) + sim.finHealthScore) /
      (MOCK_SHG_MEMBERS.length + 1)
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TranslatedText style={styles.header}>SHG Community</TranslatedText>
        <TranslatedText style={styles.subtitle}>
          Your Self-Help Group is your financial family. Learn, save, and grow together.
        </TranslatedText>

        {/* Group stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="users" size={22} color={Colors.neutral.white} style={{marginBottom: 4}} />
            <Text style={styles.statValue}>{MOCK_SHG_MEMBERS.length + 1}</Text>
            <TranslatedText style={styles.statLabel}>Members</TranslatedText>
          </View>
          <View style={styles.statCard}>
            <Feather name="dollar-sign" size={22} color={Colors.neutral.white} style={{marginBottom: 4}} />
            <Text style={styles.statValue}>₹{groupTotal.toLocaleString('en-IN')}</Text>
            <TranslatedText style={styles.statLabel}>Group Savings</TranslatedText>
          </View>
          <View style={styles.statCard}>
            <Feather name="heart" size={22} color={Colors.neutral.white} style={{marginBottom: 4}} />
            <Text style={styles.statValue}>{groupAvgHealth}</Text>
            <TranslatedText style={styles.statLabel}>Avg Health</TranslatedText>
          </View>
        </View>

        {/* Members */}
        <Text style={styles.sectionTitle}>Members</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersRow}>
          {/* Current user */}
          <View style={[styles.memberCard, styles.memberCardActive]}>
            <Text style={styles.memberAvatar}>{user.avatar}</Text>
            <Text style={styles.memberName}>You</Text>
            <Text style={[styles.memberHealth, { color: Colors.sakhi.gold }]}>{sim.finHealthScore}</Text>
            <Text style={styles.memberSavings}>₹{sim.jars.savings.toLocaleString('en-IN')}</Text>
          </View>
          {MOCK_SHG_MEMBERS.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <Text style={styles.memberAvatar}>{member.avatar}</Text>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberHealth}>{member.finHealth}</Text>
              <Text style={styles.memberSavings}>₹{member.savings.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Community tips carousel */}
        <Text style={styles.sectionTitle}>Financial Wisdom 💡</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>{COMMUNITY_TIPS[selectedTip].emoji}</Text>
          <Text style={styles.tipTitle}>{COMMUNITY_TIPS[selectedTip].title}</Text>
          <Text style={styles.tipText}>{COMMUNITY_TIPS[selectedTip].text}</Text>
          <View style={styles.tipDots}>
            {COMMUNITY_TIPS.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedTip(i)}>
                <View style={[styles.tipDot, i === selectedTip && styles.tipDotActive]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Real-world bridge */}
        <View style={styles.bridgeCard}>
          <Text style={styles.bridgeEmoji}>🌉</Text>
          <Text style={styles.bridgeTitle}>Real-World Bridge</Text>
          <Text style={styles.bridgeText}>
            Ready to apply your skills? Visit your nearest bank or post office to open a savings account. 
            Schemes like Sukanya Samriddhi Yojana offer up to 8% annual interest for girls' education!
          </Text>
          <View style={styles.bridgeTags}>
            <Text style={styles.bridgeTag}>🏦 Jan Dhan</Text>
            <Text style={styles.bridgeTag}>👧 Sukanya Samriddhi</Text>
            <Text style={styles.bridgeTag}>🏡 PM Awas</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sakhi.dark,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.neutral.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral.gray,
    lineHeight: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.sakhi.darker,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sakhi.gold + '20',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.neutral.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.white,
    marginBottom: 14,
  },
  membersRow: {
    marginBottom: 24,
  },
  memberCard: {
    backgroundColor: Colors.sakhi.darker,
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
    width: 90,
    borderWidth: 1,
    borderColor: Colors.neutral.gray + '20',
  },
  memberCardActive: {
    borderColor: Colors.sakhi.gold,
    borderWidth: 2,
  },
  memberAvatar: {
    fontSize: 28,
    marginBottom: 6,
  },
  memberName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral.white,
    marginBottom: 4,
  },
  memberHealth: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.sakhi.green,
  },
  memberSavings: {
    fontSize: 10,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: Colors.sakhi.darker,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.sakhi.gold + '20',
  },
  tipEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.sakhi.gold,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.neutral.lightGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipDots: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.gray + '40',
  },
  tipDotActive: {
    backgroundColor: Colors.sakhi.gold,
    width: 20,
  },
  bridgeCard: {
    backgroundColor: Colors.sakhi.teal + '15',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.sakhi.teal + '30',
  },
  bridgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  bridgeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.sakhi.teal,
    marginBottom: 8,
  },
  bridgeText: {
    fontSize: 14,
    color: Colors.neutral.lightGray,
    lineHeight: 22,
    marginBottom: 12,
  },
  bridgeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bridgeTag: {
    backgroundColor: Colors.sakhi.teal + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.sakhi.teal,
  },
});
