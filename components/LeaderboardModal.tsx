/**
 * LeaderboardModal.tsx
 *
 * Builds the leaderboard from ALL player profiles registered on this device.
 * Each player's XP / level / streak / trophies is read directly from their
 * AsyncStorage slot (persist:sakhi-ledger-user-<slug>) — READ-ONLY, never
 * writes anything, never touches the active player's Redux store.
 *
 * Falls back gracefully if a slot is missing or corrupt.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../store/store';
import { BADGE_META, BadgeId } from '../store/userSlice';
import { loadProfiles, nameToSlug, persistKeyForSlug } from '../store/profileRegistry';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar: string;
  trophies: number;
  isMe: boolean;
  rank: number;
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function LeaderboardModal({ visible, onDismiss }: Props) {
  const theme = useTheme();
  const { name, xp, level, streak, avatar, trophies, badges } = useSelector((s: RootState) => s.user);

  const [board, setBoard]     = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Load real player data from AsyncStorage whenever modal opens ─────────
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoading(true);

    const buildBoard = async () => {
      const profiles = await loadProfiles();
      const currentSlug = nameToSlug(name || '');
      const entries: Omit<LeaderboardEntry, 'rank'>[] = [];

      // ── Read every registered player's persisted state ─────────────────
      for (const profile of profiles) {
        if (profile.slug === currentSlug) {
          // Active player — use live Redux state (always up-to-date)
          entries.push({ name: name || profile.name, xp, level, streak, avatar, trophies, isMe: true });
        } else {
          try {
            const raw = await AsyncStorage.getItem(persistKeyForSlug(profile.slug));
            if (raw) {
              const outerParsed = JSON.parse(raw) as Record<string, string>;
              if (outerParsed.user) {
                const userState = JSON.parse(outerParsed.user) as {
                  xp?: number; level?: number; streak?: number;
                  trophies?: number; hasOnboarded?: boolean;
                };
                // Only include players who have actually completed onboarding
                if (userState.hasOnboarded) {
                  entries.push({
                    name: profile.name,
                    xp: userState.xp ?? 0,
                    level: userState.level ?? 1,
                    streak: userState.streak ?? 0,
                    avatar: profile.avatar,
                    trophies: userState.trophies ?? 0,
                    isMe: false,
                  });
                }
              }
            }
          } catch {
            // Skip players with missing or corrupt data silently
          }
        }
      }

      // ── Ensure the active player appears even if not yet in registry ────
      if (!entries.some(e => e.isMe)) {
        entries.push({ name: name || 'You', xp, level, streak, avatar, trophies, isMe: true });
      }

      // ── Sort by XP descending, assign ranks ──────────────────────────────
      const ranked: LeaderboardEntry[] = entries
        .sort((a, b) => b.xp - a.xp)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      if (!cancelled) {
        setBoard(ranked);
        setLoading(false);
      }
    };

    buildBoard();
    return () => { cancelled = true; };
  }, [visible, name, xp, level, streak, avatar, trophies]);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const rankColor = (rank: number) =>
    rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : Colors.neutral.gray;

  const rankIcon = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  const myEntry = board.find(e => e.isMe);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="trophy" size={24} color={Colors.sakhi.goldLight} style={{ marginRight: 8 }} />
              <Text style={[styles.title, { color: theme.text }]}>SHG Leaderboard</Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
                <Feather name="x" size={22} color={theme.textSub} />
              </TouchableOpacity>
            </View>

            {/* Your rank highlight */}
            {myEntry && !loading && (
              <View style={styles.myRankBanner}>
                <Text style={styles.myRankLabel}>Your Rank</Text>
                <Text style={styles.myRankNum}>{rankIcon(myEntry.rank)}</Text>
                <Text style={styles.myRankXp}>{xp.toLocaleString()} XP</Text>
              </View>
            )}

            {/* Leaderboard rows */}
            <Text style={[styles.sectionLabel, { color: theme.textSub }]}>
              PLAYERS ON THIS DEVICE
            </Text>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color={Colors.sakhi.green} />
                <Text style={[styles.loadingText, { color: theme.textSub }]}>
                  Loading rankings...
                </Text>
              </View>
            ) : board.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSub }]}>
                No players found yet. Keep playing to appear here! 🌟
              </Text>
            ) : (
              board.map((entry) => (
                <View
                  key={`${entry.name}-${entry.rank}`}
                  style={[
                    styles.row,
                    { backgroundColor: entry.isMe ? Colors.sakhi.green + '20' : theme.surface },
                    entry.isMe && { borderColor: Colors.sakhi.goldLight, borderWidth: 1.5 },
                  ]}
                >
                  <Text style={[styles.rankBadge, { color: rankColor(entry.rank) }]}>
                    {rankIcon(entry.rank)}
                  </Text>
                  <Text style={styles.rowAvatar}>{entry.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, { color: theme.text }, entry.isMe && { color: Colors.sakhi.goldLight }]}>
                      {entry.name}{entry.isMe ? ' (You)' : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                      <Text style={styles.rowSub}>Lv.{entry.level}</Text>
                      <MaterialCommunityIcons name="fire" size={12} color={Colors.sakhi.gold} />
                      <Text style={styles.rowSub}>{entry.streak}</Text>
                    </View>
                  </View>
                  <Text style={[styles.rowXp, { color: entry.isMe ? Colors.sakhi.green : theme.text }]}>
                    {entry.xp.toLocaleString()} XP
                  </Text>
                </View>
              ))
            )}

            {/* Badges */}
            <Text style={[styles.sectionLabel, { color: theme.textSub, marginTop: 20 }]}>YOUR BADGES</Text>
            {(!badges || badges.length === 0) ? (
              <Text style={[styles.noBadges, { color: theme.textSub }]}>
                Complete missions to earn your first badge! 🏅
              </Text>
            ) : (
              <View style={styles.badgesGrid}>
                {(badges as BadgeId[]).map((b) => {
                  const meta = BADGE_META[b];
                  return (
                    <View key={b} style={[styles.badgeChip, { backgroundColor: theme.surface }]}>
                      <Text style={styles.badgeIcon}>{meta.icon}</Text>
                      <Text style={[styles.badgeLabel, { color: theme.text }]}>{meta.label}</Text>
                      <Text style={[styles.badgeDesc, { color: theme.textSub }]}>{meta.desc}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Locked badges preview */}
            <Text style={[styles.sectionLabel, { color: theme.textSub, marginTop: 16 }]}>LOCKED BADGES</Text>
            <View style={styles.badgesGrid}>
              {(Object.keys(BADGE_META) as BadgeId[])
                .filter(b => !(badges as BadgeId[] || []).includes(b))
                .map(b => {
                  const meta = BADGE_META[b];
                  return (
                    <View key={b} style={[styles.badgeChip, { backgroundColor: theme.surface, opacity: 0.45 }]}>
                      <Text style={styles.badgeIcon}>🔒</Text>
                      <Text style={[styles.badgeLabel, { color: theme.textSub }]}>{meta.label}</Text>
                      <Text style={[styles.badgeDesc, { color: theme.textSub }]}>{meta.desc}</Text>
                    </View>
                  );
                })}
            </View>

            <TouchableOpacity style={[styles.doneBtn, { backgroundColor: theme.surface }]} onPress={onDismiss}>
              <Text style={[styles.doneBtnText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
    borderTopWidth: 3,
    borderTopColor: Colors.sakhi.goldLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  myRankBanner: {
    backgroundColor: Colors.sakhi.green + '25',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.sakhi.green + '60',
    marginBottom: 16,
    gap: 12,
  },
  myRankLabel: {
    color: Colors.sakhi.green,
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  myRankNum: {
    fontSize: 26,
  },
  myRankXp: {
    color: Colors.sakhi.goldLight,
    fontWeight: '900',
    fontSize: 15,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  rankBadge: {
    fontSize: 18,
    fontWeight: '900',
    minWidth: 28,
    textAlign: 'center',
  },
  rowAvatar: {
    fontSize: 22,
  },
  rowName: {
    fontSize: 14,
    fontWeight: '800',
  },
  rowSub: {
    fontSize: 11,
    color: Colors.neutral.gray,
    fontWeight: '700',
  },
  rowXp: {
    fontSize: 13,
    fontWeight: '900',
  },
  noBadges: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  badgeChip: {
    width: '47%',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  doneBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
