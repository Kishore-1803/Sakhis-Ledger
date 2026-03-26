import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { BADGE_META, BadgeId } from '../store/userSlice';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Simulated SHG community leaderboard peers
const PEERS = [
  { name: 'Lakshmi',  xp: 3400, level: 4, streak: 7,  avatar: '👩', trophies: 5 },
  { name: 'Priya',    xp: 2950, level: 3, streak: 5,  avatar: '👧', trophies: 4 },
  { name: 'Meena',    xp: 2100, level: 3, streak: 3,  avatar: '👩', trophies: 3 },
  { name: 'Sunita',   xp: 1850, level: 2, streak: 2,  avatar: '👵', trophies: 2 },
  { name: 'Anita',    xp: 1200, level: 2, streak: 1,  avatar: '👩', trophies: 1 },
  { name: 'Kavita',   xp:  850, level: 1, streak: 4,  avatar: '👧', trophies: 2 },
];

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function LeaderboardModal({ visible, onDismiss }: Props) {
  const theme = useTheme();
  const { name, xp, level, streak, avatar, trophies, badges } = useSelector((s: RootState) => s.user);

  const board = useMemo(() => {
    const all = [
      { name: name || 'You', xp, level, streak, avatar, trophies, isMe: true },
      ...PEERS.map(p => ({ ...p, isMe: false })),
    ].sort((a, b) => b.xp - a.xp);
    return all.map((entry, i) => ({ ...entry, rank: i + 1 }));
  }, [name, xp, level, streak, avatar, trophies]);

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
            {myEntry && (
              <View style={styles.myRankBanner}>
                <Text style={styles.myRankLabel}>Your Rank</Text>
                <Text style={styles.myRankNum}>{rankIcon(myEntry.rank)}</Text>
                <Text style={styles.myRankXp}>{xp.toLocaleString()} XP</Text>
              </View>
            )}

            {/* Leaderboard rows */}
            <Text style={[styles.sectionLabel, { color: theme.textSub }]}>COMMUNITY RANKING</Text>
            {board.map((entry) => (
              <View
                key={entry.name}
                style={[
                  styles.row,
                  { backgroundColor: entry.isMe ? Colors.sakhi.green + '20' : theme.surface },
                  entry.isMe && { borderColor: Colors.sakhi.goldLight, borderWidth: 1.5 },
                ]}
              >
                <Text style={[styles.rankBadge, { color: rankColor(entry.rank) }]}>{rankIcon(entry.rank)}</Text>
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
            ))}

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
