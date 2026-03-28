import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../utils/useTheme';
import Feather from '@expo/vector-icons/Feather';

interface TreeWidgetProps {
  onPress?: () => void;
}

const TREE_TIERS = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

export default function TreeWidget({ onPress }: TreeWidgetProps) {
  const theme = useTheme();
  const fortuneTree = useSelector((state: RootState) => state.engagement?.fortuneTree);
  const user = useSelector((state: RootState) => state.user);
  const simulation = useSelector((state: RootState) => state.simulation);

  const currentTier = fortuneTree?.treeTier || 0;
  const nextThreshold = TREE_TIERS[Math.min(currentTier + 1, TREE_TIERS.length - 1)] || TREE_TIERS[TREE_TIERS.length - 1];

  // Calculate growth points
  const totalJars = Object.values(simulation?.jars || {}).reduce((a, b) => (a + Number(b)) || 0, 0);
  const currentGrowthPoints = (totalJars * 0.1) + ((user?.level || 1) * 5) + ((simulation?.jars?.savings || 0) / 1000);
  const progress = Math.min((currentGrowthPoints / nextThreshold) * 100, 100);

  let treeEmoji = '🌱';
  if (currentTier >= 1) treeEmoji = '🌿';
  if (currentTier >= 2) treeEmoji = '🌲';
  if (currentTier >= 3) treeEmoji = '🌳';
  if (currentTier >= 5) treeEmoji = '🌴';
  if (currentTier >= 7) treeEmoji = '🌲';
  if (currentTier >= 9) treeEmoji = '✨';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <Text style={styles.emoji}>{treeEmoji}</Text>
          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.text }]}>Fortune Tree</Text>
            <Text style={[styles.subtitle, { color: theme.textSub }]}>
              Tier {currentTier + 1} of {TREE_TIERS.length}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSub} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress}%`,
              backgroundColor: '#2ECC71',
            },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: theme.textSub }]}>
        {Math.floor(currentGrowthPoints)} / {nextThreshold} growth points
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
