import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  Animated, Platform, Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { claimDailyReward, addXP } from '../store/userSlice';
import { Colors } from '../constants/theme';
import { t, LanguageCode } from '../utils/i18n';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const BONUS_XP = 100;

const PARTICLE_ICONS = ['⭐', '✨', '🌟', '💫', '🌸', '🎯', '🏅', '⚡'];
const PARTICLE_ANGLES = Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function DailyRewardModal({ visible, onDismiss }: Props) {
  const dispatch = useDispatch();
  const { name, streak, language } = useSelector((state: RootState) => state.user);
  const lang = language as LanguageCode;

  // ── Animation refs ────────────────────────────────────────────────────────
  const cardScale   = useRef(new Animated.Value(0.3)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const trophyRock  = useRef(new Animated.Value(0)).current;
  const glowPulse   = useRef(new Animated.Value(0.4)).current;

  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  let glowLoop: Animated.CompositeAnimation | null = null;
  let trophyLoop: Animated.CompositeAnimation | null = null;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.3);
      cardOpacity.setValue(0);
      trophyRock.setValue(0);
      glowPulse.setValue(0.4);
      particleAnims.forEach(p => p.setValue(0));

      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1, bounciness: 14, speed: 10,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(cardOpacity, {
          toValue: 1, duration: 280,
          useNativeDriver: Platform.OS !== 'web',
        }),
        ...particleAnims.map((p, i) =>
          Animated.spring(p, {
            toValue: 1, bounciness: 10, speed: 4 + i * 0.3,
            useNativeDriver: Platform.OS !== 'web',
          })
        ),
      ]).start();

      glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 1, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(glowPulse, { toValue: 0.4, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      glowLoop.start();

      trophyLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(trophyRock, { toValue: 1, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(trophyRock, { toValue: -1, duration: 1800, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(trophyRock, { toValue: 0, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      trophyLoop.start();
    } else {
      glowLoop?.stop();
      trophyLoop?.stop();
    }
  }, [visible]);

  const handleClaim = () => {
    dispatch(claimDailyReward());
    dispatch(addXP(BONUS_XP));
    Animated.parallel([
      Animated.timing(cardScale, { toValue: 0.3, duration: 280, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(cardOpacity, { toValue: 0, duration: 260, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => onDismiss());
  };

  const trophyRotate = trophyRock.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  // Streak milestone label — uses i18n keys
  const streakMilestoneLabel =
    streak >= 7 ? t('weekChampionLabel', lang)
    : streak >= 3 ? t('threeDayWarriorLabel', lang)
    : t('streakLabel', lang);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: cardOpacity }]}>

        {/* Floating particles */}
        {particleAnims.map((anim, i) => {
          const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(PARTICLE_ANGLES[i]) * 130] });
          const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(PARTICLE_ANGLES[i]) * 130] });
          const po = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 0.7] });
          return (
            <Animated.Text
              key={i}
              style={[styles.particle, { opacity: po, transform: [{ translateX: tx }, { translateY: ty }] }]}
            >
              {PARTICLE_ICONS[i]}
            </Animated.Text>
          );
        })}

        {/* Main card */}
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <Animated.View style={[styles.glowRing, { opacity: glowPulse }]} />

          {/* Trophy */}
          <Animated.Text style={[styles.trophy, { transform: [{ rotate: trophyRotate }] }]}>
            🏆
          </Animated.Text>

          <Text style={styles.title}>{t('allMissionsDone', lang)} 🎉</Text>
          <Text style={styles.subtitle}>
            {name || 'Sakhi'} — {t('greatJobToday', lang)} 🌸
          </Text>

          {/* Streak badge */}
          <View style={styles.streakBadge}>
            <MaterialCommunityIcons name="fire" size={32} color={Colors.sakhi.coral} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>{streakMilestoneLabel}</Text>
            </View>
          </View>

          {/* Rewards list */}
          <View style={styles.rewardsCard}>
            <Text style={styles.rewardsTitle}>✨ {t('todaysRewards', lang)}</Text>
            <RewardRow icon="⭐" text={t('bonusXPText', lang)} color={Colors.sakhi.goldLight} />
            <RewardRow icon="🏅" text={t('bonusTrophyText', lang)} color="#CD7F32" />
            <RewardRow icon="🌅" text={t('freshQuestsTomorrow', lang)} color={Colors.sakhi.teal} />
          </View>

          {/* Offline notice */}
          <View style={styles.offlineBox}>
            <Text style={styles.offlineText}>
              📱 {t('offlineSafeMsg', lang)}
            </Text>
          </View>

          {/* Claim button */}
          <TouchableOpacity style={styles.claimBtn} onPress={handleClaim} activeOpacity={0.85}>
            <MaterialCommunityIcons name="star-shooting" size={22} color="#1A1A2E" style={{ marginRight: 8 }} />
            <Text style={styles.claimBtnText}>{t('claimRewardBtn', lang)} ✨</Text>
          </TouchableOpacity>

          <Text style={styles.seeYou}>{t('seeYouTomorrow', lang)} 🌈</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function RewardRow({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={styles.rewardRow}>
      <Text style={styles.rewardIcon}>{icon}</Text>
      <Text style={[styles.rewardText, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 26,
  },
  card: {
    width: width * 0.88,
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.sakhi.goldLight,
    shadowColor: Colors.sakhi.goldLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 22,
  },
  glowRing: {
    position: 'absolute',
    width: '118%',
    height: '110%',
    borderRadius: 34,
    borderWidth: 3,
    borderColor: Colors.sakhi.goldLight + '55',
  },
  trophy: {
    fontSize: 76,
    marginBottom: 6,
    textShadowColor: Colors.sakhi.goldLight,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.15)',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.sakhi.coral + '55',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.sakhi.coral,
    lineHeight: 32,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  rewardsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,215,0,0.07)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.sakhi.goldLight + '28',
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  rewardIcon: { fontSize: 17, marginTop: 1 },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  offlineBox: {
    backgroundColor: 'rgba(26,188,156,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.sakhi.teal + '40',
    marginBottom: 18,
    width: '100%',
  },
  offlineText: {
    fontSize: 12,
    color: Colors.sakhi.teal,
    fontWeight: '700',
    textAlign: 'center',
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.sakhi.goldLight,
    paddingHorizontal: 34,
    paddingVertical: 15,
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: Colors.sakhi.goldDark,
    marginBottom: 10,
    shadowColor: Colors.sakhi.goldLight,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  claimBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A2E',
    letterSpacing: 0.5,
  },
  seeYou: {
    fontSize: 12,
    color: '#6B7280',
  },
});
