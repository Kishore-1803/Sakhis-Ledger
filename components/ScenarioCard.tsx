import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TranslatedText } from '../components/TranslatedText';
import { Colors } from '../constants/theme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.completed]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={24} color={Colors.sakhi.dark} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardXp}>+{xpReward} XP</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
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
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: Colors.neutral.lightGray + '50',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontWeight: '700',
    color: Colors.neutral.darkGray,
    marginBottom: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardXp: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.sakhi.green,
    marginRight: 8,
  },
  rewardFlame: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.sakhi.gold,
  },
  actionContainer: {
    marginLeft: 12,
  },
  goBtn: {
    backgroundColor: Colors.sakhi.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  goBtnText: {
    color: Colors.neutral.white,
    fontWeight: '800',
    fontSize: 12,
  },
  completedBadge: {
    backgroundColor: Colors.neutral.lightGray,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 16,
  },
});
