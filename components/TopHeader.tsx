import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import LanguageSettingsModal from './LanguageSettingsModal';
import LeaderboardModal from './LeaderboardModal';
import { t, LanguageCode } from '../utils/i18n';
import TranslatedText from './TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TopHeader() {
  const { name, avatar, xp, level, streak, trophies, language, badges } = useSelector((state: RootState) => state.user);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const theme = useTheme();
  const lang = language as string;

  // XP Burst animation
  const prevXp = useRef(xp);
  const burstY = useRef(new Animated.Value(0)).current;
  const burstOpacity = useRef(new Animated.Value(0)).current;
  const burstScale = useRef(new Animated.Value(1)).current;
  const [burstDiff, setBurstDiff] = useState(0);

  useEffect(() => {
    if (xp > prevXp.current) {
      const diff = xp - prevXp.current;
      setBurstDiff(diff);
      burstY.setValue(0);
      burstOpacity.setValue(1);
      burstScale.setValue(1.4);
      Animated.parallel([
        Animated.timing(burstY, { toValue: -72, duration: 1100, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(burstScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 15, bounciness: 5 }),
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(burstOpacity, { toValue: 0, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start();
    }
    prevXp.current = xp;
  }, [xp]);

  // Streak pulse on mount and when streak changes
  const streakPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (streak > 0) {
      Animated.sequence([
        Animated.spring(streakPulse, { toValue: 1.3, useNativeDriver: Platform.OS !== 'web', speed: 25, bounciness: 10 }),
        Animated.spring(streakPulse, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 20, bounciness: 5 }),
      ]).start();
    }
  }, [streak]);

  const today = new Date();
  const dateString = today.toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
    weekday: 'short', 
    day: 'numeric', 
    month: 'short'
  });

  const currentLevelBaseXP = (level - 1) * 1000;
  const nextLevelXP = level * 1000;
  const currentLevelProgress = xp - currentLevelBaseXP;
  const progressPercent = Math.min(100, (currentLevelProgress / 1000) * 100);

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg }]}>
      {/* XP Burst Overlay */}
      <Animated.Text
        pointerEvents="none"
        style={[
          styles.xpBurst,
          { opacity: burstOpacity, transform: [{ translateY: burstY }, { scale: burstScale }] }
        ]}
      >
        +{burstDiff} XP ?
      </Animated.Text>

      {/* Top Row: Title & Icons */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
            <MaterialCommunityIcons name="flower" size={26} color={Colors.sakhi.goldLight} style={{ marginRight: 6 }} />
            <Text style={styles.logoText} numberOfLines={1} adjustsFontSizeToFit>{t('sakhisLedger', lang as any)}</Text>
          </View>
        </View>
        <View style={styles.rightIcons}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText} numberOfLines={1} adjustsFontSizeToFit>{dateString}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowLeaderboard(true)}>
            <MaterialCommunityIcons name="trophy" size={17} color={Colors.sakhi.goldLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
            <Feather name="settings" size={18} color={Colors.sakhi.goldLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Level Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.levelBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="star" size={13} color={'#1A1A2E'} style={{ marginRight: 4 }} />
            <Text style={styles.levelBadgeText}>Lv.{level}</Text>
          </View>
        </View>
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp}/{nextLevelXP} XP</Text>
      </View>

      {/* Bottom Row: Profile & Stats */}
      <View style={styles.bottomRow}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={{ fontSize: 24 }}>{avatar || '??'}</Text>
          </View>
          <View>
            <Text style={styles.nameText}>{name || 'Sakhi'}</Text>
            <Text style={styles.titleSubText}>{t('financialWarrior', lang)}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Animated.View style={[styles.statItem, { transform: [{ scale: streakPulse }] }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="fire" size={16} color={Colors.sakhi.gold} style={{ marginRight: 4 }} />
              <Text style={styles.statText}>{streak}</Text>
            </View>
          </Animated.View>
          <View style={styles.statItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="trophy" size={16} color={Colors.sakhi.gold} style={{ marginRight: 4 }} />
              <Text style={styles.statText}>{trophies}</Text>
            </View>
          </View>
        </View>
      </View>

      <LanguageSettingsModal
        visible={showSettings}
        onDismiss={() => setShowSettings(false)}
      />
      <LeaderboardModal
        visible={showLeaderboard}
        onDismiss={() => setShowLeaderboard(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#218C53',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: Colors.sakhi.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  logoText: {
    color: Colors.sakhi.goldLight,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flexShrink: 1,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  dateText: {
    color: Colors.sakhi.goldLight,
    fontSize: 10,
    fontWeight: '800',
  },
  iconBtn: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  iconText: {
    fontSize: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  levelBadge: {
    backgroundColor: Colors.sakhi.goldLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
    position: 'absolute',
    left: 0,
    zIndex: 2,
    top: -5,
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  levelBadgeText: {
    color: '#1A1A2E',
    fontWeight: '900',
    fontSize: 13,
  },
  progressBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    height: 16,
    borderRadius: 8,
    width: '82%',
    marginLeft: 'auto',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark,
  },
  progressBarFill: {
    backgroundColor: Colors.sakhi.goldLight,
    height: '100%',
    borderRadius: 6,
  },
  xpText: {
    color: Colors.sakhi.goldLight,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: Colors.neutral.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 3,
    borderColor: Colors.sakhi.goldLight,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  avatar: {
    fontSize: 22,
  },
  nameText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleSubText: {
    color: Colors.sakhi.goldLight,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  statText: {
    color: Colors.sakhi.goldLight,
    fontSize: 14,
    fontWeight: '800',
  },
  xpBurst: {
    position: 'absolute',
    right: 20,
    top: 55,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    zIndex: 999,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
});
