import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TranslatedText } from '../components/TranslatedText';
import { Colors } from '../constants/theme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useTheme } from '../utils/useTheme';

interface ScenarioCardProps {
  title: string;
  category: string;
  completed: boolean;
  xpReward?: number;
  onPress: () => void;
}

const categoryIcon: Record<string, keyof typeof Feather.glyphMap> = {
  budgeting: 'dollar-sign',
  savings: 'briefcase',
  emergency: 'activity',
  investment: 'trending-up',
  planning: 'clipboard',
};

export default function ScenarioCard({ title, category, completed, xpReward = 100, onPress }: ScenarioCardProps) {
  const iconName = categoryIcon[category] || 'book-open';
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }, completed && styles.completed]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={24} color={Colors.sakhi.goldLight} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <View style={styles.rewardRow}>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardXp}>+{xpReward} XP</Text>
            </View>
            <View style={[styles.rewardPill, { backgroundColor: Colors.sakhi.gold + '20' }]}>
              <Text style={styles.rewardFlame}>+{Math.floor(xpReward/2)}</Text>
              <MaterialCommunityIcons name="fire" size={12} color={Colors.sakhi.gold} />
            </View>
          </View>
        </View>
        <View style={styles.actionContainer}>
          {completed ? (
            <View style={styles.completedBadge}>
              <Feather name="check" size={20} color={Colors.sakhi.green} />
            </View>
          ) : (
            <View style={styles.goBtn}>
              <TranslatedText style={styles.goBtnText}>go</TranslatedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral.parchment,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.sakhi.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  completed: {
    opacity: 0.6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    backgroundColor: Colors.sakhi.goldDark + '20',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '40',
  },
  emoji: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sakhi.green + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rewardXp: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.sakhi.green,
  },
  rewardFlame: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.sakhi.gold,
  },
  actionContainer: {
    marginLeft: 12,
  },
  goBtn: {
    backgroundColor: Colors.sakhi.green,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: Colors.sakhi.greenDark,
  },
  goBtnText: {
    color: Colors.neutral.white,
    fontWeight: '900',
    fontSize: 13,
  },
  completedBadge: {
    backgroundColor: Colors.sakhi.green + '20',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.sakhi.green,
  },
  completedEmoji: {
    fontSize: 16,
  },
});
