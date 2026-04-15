/**
 * FortuneTreeScreen.tsx  –  Fully rewritten for engagement.
 *
 * Key changes vs the old version:
 *  • Reads growthPoints from Redux (fortuneTree.growthPoints) — not recomputed
 *  • Rich animated tree with per-tier colour palette + glowing ring
 *  • Activity Tracker shows how many points each action awards
 *  • Milestone cards with celebration state (reached, current, locked)
 *  • "How to grow" accordion section — offline, SHG-friendly
 *  • No leaderboard — all data is local
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Easing, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../utils/useTheme';
import { Colors } from '../constants/theme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AudioEngine } from '../utils/audioEngine';
import { LanguageCode } from '../utils/i18n';

const { width } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────────────────────────

const TREE_TIERS = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

interface TierMeta {
  emoji: string;
  label: string;
  color: string;
  glowColor: string;
  desc: string;
}

const TIER_META: TierMeta[] = [
  { emoji: '🌱', label: 'Seed',        color: '#7FB77E', glowColor: '#7FB77E50', desc: 'Your journey begins. Every rupee saved is a seed planted.' },
  { emoji: '🌿', label: 'Sprout',      color: '#52B788', glowColor: '#52B78850', desc: 'Tiny roots taking hold. Keep budgeting every day!' },
  { emoji: '🪴', label: 'Sapling',     color: '#40916C', glowColor: '#40916C60', desc: 'Standing tall! Your savings jar is building strength.' },
  { emoji: '🌲', label: 'Young Tree',  color: '#2D6A4F', glowColor: '#2D6A4F60', desc: 'Protection branch unlocked. Emergencies can\'t break you now.' },
  { emoji: '🌳', label: 'Mature Tree', color: '#1B4332', glowColor: '#1B433270', desc: 'Solid and strong. You\'re planning ahead like a true Sakhi.' },
  { emoji: '🌴', label: 'Palm',        color: '#F4A261', glowColor: '#F4A26170', desc: 'Education branch blooms. Knowledge is your greatest wealth.' },
  { emoji: '🎄', label: 'Rich Tree',   color: '#E76F51', glowColor: '#E76F5170', desc: 'So tall the whole village sees your growth.' },
  { emoji: '🌳', label: 'Elder Tree',  color: '#264653', glowColor: '#26465370', desc: 'Business branch strong. You are building something lasting.' },
  { emoji: '🌺', label: 'Blossoming',  color: '#E9C46A', glowColor: '#E9C46A70', desc: 'Your prosperity touches everyone around you.' },
  { emoji: '✨🌳✨', label: 'Village Tree', color: '#FFD700', glowColor: '#FFD70080', desc: 'Peak of Prosperity! Share your wisdom with your SHG sisters.' },
];

const BRANCHES = [
  { tier: 3, icon: '🛡️', name: 'Protection Branch', detail: 'Emergency fund mastered — you are protected from sudden shocks.' },
  { tier: 5, icon: '📚', name: 'Education Branch',   detail: 'You invest in knowledge — it multiplies like compound interest.' },
  { tier: 7, icon: '🌱', name: 'Business Branch',    detail: 'You think like an entrepreneur. Small businesses start here.' },
  { tier: 10, icon: '🌳', name: 'Prosperity Branch', detail: 'Village-level impact. Your tree shelters your whole SHG.' },
];

const ACTIVITIES = [
  { icon: '🏺', label: 'Allocate ₹100 to a Jar',   points: 1,  tip: 'Every ₹100 = 1 growth point' },
  { icon: '📖', label: 'Complete a Quest (optimal)',  points: 15, tip: 'Optimal choices = 15 pts' },
  { icon: '📖', label: 'Complete a Quest (learning)', points: 8,  tip: 'Any choice = 8 pts' },
  { icon: '🛡️', label: 'Bust a Scam (correct)',       points: 20, tip: 'Sharp mind = 20 pts' },
  { icon: '🛡️', label: 'Bust a Scam (learning)',      points: 5,  tip: 'Every attempt counts' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FortuneTreeScreen() {
  const theme     = useTheme();
  const fortuneTree = useSelector((state: RootState) => state.engagement?.fortuneTree);
  const user        = useSelector((state: RootState) => state.user);
  const lang        = user.language as LanguageCode;

  const [selectedBranch, setSelectedBranch] = useState<typeof BRANCHES[0] | null>(null);
  const [showActivities, setShowActivities] = useState(false);

  // ── Derived values
  const growthPoints = fortuneTree?.growthPoints ?? 0;
  const currentTier  = Math.max(0, (fortuneTree?.treeTier ?? 1) - 1); // 0-indexed for TIER_META
  const tierMeta     = TIER_META[Math.min(currentTier, TIER_META.length - 1)];

  // Progress within the current tier
  const currentThreshold = TREE_TIERS[Math.min(currentTier, TREE_TIERS.length - 1)];
  const nextThreshold    = TREE_TIERS[Math.min(currentTier + 1, TREE_TIERS.length - 1)];
  const tierRange        = Math.max(1, nextThreshold - currentThreshold);
  const tierProgress     = Math.min(1, (growthPoints - currentThreshold) / tierRange);
  const isMaxTier        = currentTier >= TREE_TIERS.length - 1;

  // ── Animations
  const sway   = useRef(new Animated.Value(0)).current;
  const glow   = useRef(new Animated.Value(0.4)).current;
  const barW   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Tree sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(sway, { toValue: -1, duration: 2500, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(glow, { toValue: 0.4, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();

    // Progress bar animation
    Animated.timing(barW, { toValue: tierProgress, duration: 1200, useNativeDriver: false, easing: Easing.out(Easing.cubic) }).start();
  }, [tierProgress]);

  const swayDeg = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-4deg', '4deg'] });

  const playAudio = () => {
    AudioEngine.play(
      `Fortune Tree. You are at tier ${currentTier + 1}, ${tierMeta.label}. ${tierMeta.desc} Keep allocating to your jars and completing quests to grow further.`,
      lang
    );
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: theme.headerBg || '#1A4731' }]}>
        <View>
          <Text style={styles.headerTitle}>🌳 Fortune Tree</Text>
          <Text style={styles.headerSub}>Your wealth grows like a tree</Text>
        </View>
        <TouchableOpacity onPress={playAudio} style={styles.audioBtn}>
          <Feather name="volume-2" size={22} color={Colors.sakhi.goldLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Tree Visual Card ── */}
        <View style={[styles.treeCard, { shadowColor: tierMeta.glowColor }]}>

          {/* Glow ring */}
          <Animated.View style={[styles.glowRing, { borderColor: tierMeta.glowColor, opacity: glow }]} />

          {/* Tree emoji */}
          <Animated.Text style={[styles.treeEmoji, { transform: [{ rotate: swayDeg }] }]}>
            {tierMeta.emoji}
          </Animated.Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierMeta.color }]}>
            <Text style={styles.tierBadgeText}>Tier {currentTier + 1} — {tierMeta.label}</Text>
          </View>

          <Text style={[styles.tierDesc, { color: theme.textSub }]}>{tierMeta.desc}</Text>
        </View>

        {/* ── Growth Progress ── */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.progressRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="sprout" size={18} color={Colors.sakhi.green} style={{ marginRight: 6 }} />
              <Text style={[styles.progressLabel, { color: theme.text }]}>Growth Points</Text>
            </View>
            <Text style={[styles.progressValue, { color: Colors.sakhi.green }]}>
              {growthPoints.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: theme.isDark ? '#1C3A2A' : '#E8F5E9' }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: tierMeta.color,
                  width: barW.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                },
              ]}
            />
          </View>

          {isMaxTier ? (
            <Text style={[styles.progressHint, { color: Colors.sakhi.goldLight }]}>
              🏆 Maximum Tier Reached! You are a Village Tree!
            </Text>
          ) : (
            <Text style={[styles.progressHint, { color: theme.textSub }]}>
              {(nextThreshold - growthPoints).toLocaleString('en-IN')} points to {TIER_META[currentTier + 1]?.label || 'next tier'}
            </Text>
          )}
        </View>

        {/* ── Milestone Rail ── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🪜 Milestones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <View style={styles.milestoneRow}>
            {TIER_META.map((m, i) => {
              const reached  = i < currentTier;
              const isCurrent = i === currentTier;
              return (
                <View key={i} style={styles.milestoneItem}>
                  <View style={[
                    styles.milestoneBubble,
                    reached  && { backgroundColor: Colors.sakhi.green, borderColor: Colors.sakhi.green },
                    isCurrent && { backgroundColor: tierMeta.color, borderColor: tierMeta.color, transform: [{ scale: 1.2 }] },
                    !reached && !isCurrent && { backgroundColor: theme.card, borderColor: theme.border },
                  ]}>
                    <Text style={styles.milestoneEmoji}>{m.emoji.length > 2 ? '✨' : m.emoji}</Text>
                  </View>
                  {i < TIER_META.length - 1 && (
                    <View style={[styles.connectorLine, { backgroundColor: reached ? Colors.sakhi.green : theme.border }]} />
                  )}
                  <Text style={[styles.milestoneLabel, { color: isCurrent ? tierMeta.color : theme.textSub }]}>
                    {m.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* ── Branches ── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🌿 Branches to Unlock</Text>
        {BRANCHES.map((b) => {
          const unlocked = (fortuneTree?.treeTier ?? 0) >= b.tier;
          return (
            <TouchableOpacity
              key={b.tier}
              style={[
                styles.branchCard,
                { backgroundColor: theme.card },
                unlocked && { borderLeftColor: Colors.sakhi.green, borderLeftWidth: 4 },
                !unlocked && { opacity: 0.65 },
              ]}
              onPress={() => unlocked && setSelectedBranch(b)}
              activeOpacity={unlocked ? 0.75 : 1}
            >
              <Text style={styles.branchIcon}>{b.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.branchName, { color: theme.text }]}>{b.name}</Text>
                <Text style={[styles.branchMeta, { color: theme.textSub }]}>
                  {unlocked ? '✅ Unlocked' : `🔒 Unlocks at Tier ${b.tier}`}
                </Text>
              </View>
              {unlocked && <Feather name="chevron-right" size={20} color={Colors.sakhi.green} />}
            </TouchableOpacity>
          );
        })}

        {/* ── How to Grow (Activity Guide) ── */}
        <TouchableOpacity
          style={[styles.accordionHeader, { backgroundColor: theme.card }]}
          onPress={() => setShowActivities(v => !v)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="sprout-outline" size={20} color={Colors.sakhi.green} style={{ marginRight: 8 }} />
            <Text style={[styles.accordionTitle, { color: theme.text }]}>How to Grow Your Tree</Text>
          </View>
          <Feather name={showActivities ? 'chevron-up' : 'chevron-down'} size={20} color={theme.textSub} />
        </TouchableOpacity>

        {showActivities && (
          <View style={[styles.activitiesBox, { backgroundColor: theme.card }]}>
            {ACTIVITIES.map((a, i) => (
              <View key={i} style={[styles.activityRow, i < ACTIVITIES.length - 1 && styles.activityDivider]}>
                <Text style={styles.activityIcon}>{a.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityLabel, { color: theme.text }]}>{a.label}</Text>
                  <Text style={[styles.activityTip, { color: theme.textSub }]}>{a.tip}</Text>
                </View>
                <View style={[styles.pointsBadge, { backgroundColor: Colors.sakhi.green + '20' }]}>
                  <Text style={styles.pointsText}>+{a.points}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Branch Detail Modal ── */}
      <Modal visible={!!selectedBranch} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedBranch(null)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={styles.modalEmoji}>{selectedBranch?.icon}</Text>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedBranch?.name}</Text>
            <Text style={[styles.modalDetail, { color: theme.textSub }]}>{selectedBranch?.detail}</Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: Colors.sakhi.green }]}
              onPress={() => setSelectedBranch(null)}
            >
              <Text style={styles.modalBtnText}>Keep Growing! 🌱</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: Colors.sakhi.goldLight + '40',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  audioBtn: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
  },

  scroll: { padding: 16 },

  // ── Tree card
  treeCard: {
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#0D2B1A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'visible',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    top: '50%',
    marginTop: -80,
    left: '50%',
    marginLeft: -80,
  },
  treeEmoji: {
    fontSize: 100,
    marginBottom: 12,
    textAlign: 'center',
  },
  tierBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  tierBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tierDesc: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 8,
  },

  // ── Progress card
  progressCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 7,
  },
  progressHint: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Section title
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // ── Milestone rail
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  milestoneItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  milestoneBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneEmoji: { fontSize: 20 },
  connectorLine: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  milestoneLabel: {
    fontSize: 10,
    fontWeight: '700',
    position: 'absolute',
    top: 50,
    width: 50,
    textAlign: 'center',
    left: -3,
  },

  // ── Branch cards
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  branchIcon: { fontSize: 30, marginRight: 14 },
  branchName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  branchMeta: { fontSize: 12, fontWeight: '600' },

  // ── Accordion
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 2,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accordionTitle: { fontSize: 15, fontWeight: '800' },
  activitiesBox: {
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  activityIcon: { fontSize: 24, marginRight: 12 },
  activityLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  activityTip: { fontSize: 11, fontWeight: '600' },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 8,
  },
  pointsText: {
    color: Colors.sakhi.green,
    fontSize: 13,
    fontWeight: '900',
  },

  // ── Branch modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalEmoji: { fontSize: 64, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  modalDetail: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  modalBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderBottomWidth: 3,
    borderBottomColor: Colors.sakhi.greenDark,
  },
  modalBtnText: { fontSize: 16, fontWeight: '900', color: '#fff' },
});
