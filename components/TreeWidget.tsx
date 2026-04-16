import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../utils/useTheme';
import { Colors } from '../constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { t, LanguageCode, TranslationKey } from '../utils/i18n';

const TREE_TIERS = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

const TIER_EMOJI = ['🌱','🌿','🪴','🌲','🌳','🌴','🎄','🌳','🌺','✨'];
const TIER_LABEL_KEYS: TranslationKey[] = [
  'treeTier1','treeTier2','treeTier3','treeTier4','treeTier5',
  'treeTier6','treeTier7','treeTier8','treeTier9','treeTier10',
];
const TIER_COLOR = ['#7FB77E','#52B788','#40916C','#2D6A4F','#1B4332','#F4A261','#E76F51','#264653','#E9C46A','#FFD700'];

interface TreeWidgetProps { onPress?: () => void; }

export default function TreeWidget({ onPress }: TreeWidgetProps) {
  const theme       = useTheme();
  const fortuneTree = useSelector((state: RootState) => state.engagement?.fortuneTree);
  const lang        = useSelector((state: RootState) => state.user.language as LanguageCode);

  // Read directly from persisted Redux state
  const growthPoints = fortuneTree?.growthPoints ?? 0;
  const currentTier  = Math.max(0, (fortuneTree?.treeTier ?? 1) - 1);

  const currentThreshold = TREE_TIERS[Math.min(currentTier, TREE_TIERS.length - 1)];
  const nextThreshold    = TREE_TIERS[Math.min(currentTier + 1, TREE_TIERS.length - 1)];
  const tierRange        = Math.max(1, nextThreshold - currentThreshold);
  const progress         = Math.min(1, (growthPoints - currentThreshold) / tierRange);

  const emoji     = TIER_EMOJI[Math.min(currentTier, TIER_EMOJI.length - 1)];
  const labelKey  = TIER_LABEL_KEYS[Math.min(currentTier, TIER_LABEL_KEYS.length - 1)];
  const color     = TIER_COLOR[Math.min(currentTier, TIER_COLOR.length - 1)];

  // Animated progress bar
  const barW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barW, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.row}>
        <View style={[styles.emojiBox, { backgroundColor: color + '22', borderColor: color + '60' }]}>
          <Text style={styles.emoji}>{emoji.length > 2 ? '✨' : emoji}</Text>
        </View>
        <View style={styles.info}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.title, { color: theme.text }]}>{t('fortuneTree', lang)}</Text>
            <View style={[styles.tierChip, { backgroundColor: color + '25', borderColor: color + '60' }]}>
              <Text style={[styles.tierChipText, { color }]}>{t(labelKey, lang)}</Text>
            </View>
          </View>
          <Text style={[styles.pts, { color: theme.textSub }]}>
            {growthPoints.toLocaleString('en-IN')} pts · {(nextThreshold - growthPoints).toLocaleString('en-IN')} to next
          </Text>
        </View>
        <MaterialCommunityIcons name="sprout" size={20} color={Colors.sakhi.green} />
      </View>

      {/* Animated progress bar */}
      <View style={[styles.track, { backgroundColor: theme.isDark ? '#1C3A2A' : '#E8F5E9' }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: barW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 24 },
  info: { flex: 1, marginRight: 8 },
  title: {
    fontSize: 14,
    fontWeight: '800',
    marginRight: 8,
    marginBottom: 4,
  },
  tierChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  tierChipText: {
    fontSize: 10,
    fontWeight: '900',
  },
  pts: {
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
