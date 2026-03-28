import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { applyLifeEvent, dismissLifeEvent } from '../store/simulationSlice';
import { addXP, completeDailyMission } from '../store/userSlice';
import TopHeader from '../components/TopHeader';
import JarCard from '../components/JarCard';
import TreeWidget from '../components/TreeWidget';
import LifeEventModal from '../components/LifeEventModal';
import DailyTimerBanner from '../components/DailyTimerBanner';
import DailyRewardModal from '../components/DailyRewardModal';
import OfflineBanner from '../components/OfflineBanner';
import { triggerRandomLifeEvent, LifeEvent } from '../engine/lifeEvents';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import { AudioEngine } from '../utils/audioEngine';
import { TranslatedText } from '../components/TranslatedText';
import { t, LanguageCode } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface HomeScreenProps {
  navigation: any;
}

// Mission config — each with a unique accent colour for the SHG audience
const MISSIONS = [
  { id: 'quest',  icon: 'book',         title: 'complete1Lesson',  xp: 50,  flame: 25,  nav: 'Quests', color: '#3498DB', label: 'Quest' },
  { id: 'arena',  icon: 'shield',       title: 'defeatAScam',      xp: 100, flame: 50,  nav: 'Arena',  color: '#E74C3C', label: 'Arena' },
  { id: 'jars',   icon: 'briefcase',    title: 'addToSavingsJar',  xp: 30,  flame: 15,  nav: 'Jars',   color: '#2ECC71', label: 'Jars'  },
  { id: 'event',  icon: 'alert-circle', title: 'faceALifeEvent',   xp: 20,  flame: 10,  nav: null,     color: '#F39C12', label: 'Event' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useDispatch();
  const user    = useSelector((state: RootState) => state.user);
  const sim     = useSelector((state: RootState) => state.simulation);
  const lang    = user.language as LanguageCode;
  const theme   = useTheme();

  const dailyDeadline          = user.dailyDeadline ?? 0;
  const dailyMissionsCompleted: string[] = user.dailyMissionsCompleted ?? [];
  const dailyRewardClaimed     = user.dailyRewardClaimed ?? false;

  const [lifeEvent, setLifeEvent]         = useState<LifeEvent | null>(null);
  const [showEvent, setShowEvent]         = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);

  const isOnTime = () => dailyDeadline > 0 && Date.now() < dailyDeadline;
  const doneCount = dailyMissionsCompleted.length;
  const allDone   = doneCount >= MISSIONS.length;

  // Show daily reward modal when all missions done and reward not yet claimed
  useEffect(() => {
    if (allDone && !dailyRewardClaimed) {
      const timer = setTimeout(() => setShowDailyReward(true), 900);
      return () => clearTimeout(timer);
    }
  }, [allDone, dailyRewardClaimed]);

  const handleMissionPress = (missionId: string, _xp: number, action: () => void) => {
    // Guard: MissionRow already blocks taps on done rows, but keep this safety net.
    if (dailyMissionsCompleted.includes(missionId)) return;
    // All missions handle their own completeDailyMission + XP inside their screens.
    action();
  };

  const handleTriggerEvent = () => {
    const event = triggerRandomLifeEvent(true);
    if (event) {
      setLifeEvent(event);
      setShowEvent(true);
      dispatch(applyLifeEvent({ jar: event.impact.jar, amount: event.impact.amount, eventId: event.id }));

      // Award the event's OWN xpReward (150–200), not a hardcoded number.
      // Mark 'event' mission done only once per day.
      if (!dailyMissionsCompleted.includes('event')) {
        const xpToAward = isOnTime() ? event.xpReward : Math.floor(event.xpReward * 0.3);
        dispatch(addXP(xpToAward));
        dispatch(completeDailyMission('event'));
      }
    }
  };

  const playAudioHelp = () => {
    const text = t('dailyMissions', lang) + '. ' + (lang === 'en' ? 'Complete tasks to earn XP.' : 'कार्य पूरा करें XP कमाएं।');
    AudioEngine.play(text, lang);
  };

  const jarData = [
    { name: 'household', amount: sim.jars.household, icon: 'home',      goal: 6000 },
    { name: 'children',  amount: sim.jars.children,  icon: 'smile',     goal: 3000 },
    { name: 'savings',   amount: sim.jars.savings,   icon: 'briefcase', goal: 5000 },
    { name: 'emergency', amount: sim.jars.emergency, icon: 'shield',    goal: 4000 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} />

      {/* Offline banner slides in from very top */}
      <OfflineBanner />

      {/* Gamified Header */}
      <TopHeader />

      {/* Daily Timer */}
      <DailyTimerBanner />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Daily Missions Progress Card ── */}
        <View style={[styles.progressOverview, { backgroundColor: theme.card }]}>
          <View style={styles.progressTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="sword-cross" size={20} color={Colors.sakhi.goldLight} style={{ marginRight: 8 }} />
              <TranslatedText style={[styles.sectionTitle, { color: theme.isDark ? Colors.sakhi.goldLight : Colors.sakhi.darker }]}>
                dailyMissions
              </TranslatedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.progressPill, allDone && { backgroundColor: Colors.sakhi.green + '30', borderColor: Colors.sakhi.green }]}>
                <Text style={[styles.progressPillText, { color: allDone ? Colors.sakhi.green : Colors.sakhi.goldLight }]}>
                  {doneCount}/{MISSIONS.length} {allDone ? '✅' : '⚡'}
                </Text>
              </View>
              <TouchableOpacity onPress={playAudioHelp}>
                <Feather name="volume-2" size={22} color={Colors.sakhi.goldLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Segmented progress bar */}
          <View style={styles.segmentedBar}>
            {MISSIONS.map((m, i) => (
              <View
                key={m.id}
                style={[
                  styles.segment,
                  { backgroundColor: dailyMissionsCompleted.includes(m.id) ? m.color : theme.isDark ? '#2C3E50' : '#E9ECEF' },
                  i < MISSIONS.length - 1 && { marginRight: 4 },
                ]}
              />
            ))}
          </View>

          {allDone && !dailyRewardClaimed && (
            <TouchableOpacity style={styles.claimNowBanner} onPress={() => setShowDailyReward(true)}>
              <Text style={styles.claimNowText}>🎉 {t('claimNowBannerText', lang)} 🏆</Text>
            </TouchableOpacity>
          )}
          {allDone && dailyRewardClaimed && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeBannerText}>
                🌟 {t('alreadyClaimedText', lang)} 🌈
              </Text>
            </View>
          )}
        </View>

        {/* ── Mission Rows ── */}
        <View style={[styles.missionsCard, { backgroundColor: theme.card }]}>
          {MISSIONS.map((m, i) => (
            <MissionRow
              key={m.id}
              id={m.id}
              icon={m.icon as any}
              title={m.title}
              xpAmount={m.xp}
              flameAmount={m.flame}
              accentColor={m.color}
              done={dailyMissionsCompleted.includes(m.id)}
              onTime={isOnTime()}
              onPress={() =>
                handleMissionPress(
                  m.id,
                  m.xp,
                  m.nav ? () => navigation.navigate(m.nav) : handleTriggerEvent
                )
              }
              isLast={i === MISSIONS.length - 1}
              theme={theme}
            />
          ))}
        </View>

        {/* ── Jars Overview ── */}
        <View style={[styles.sectionHeader, { marginTop: 24, marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="treasure-chest" size={22} color={Colors.sakhi.goldLight} style={{ marginRight: 8 }} />
            <TranslatedText style={[styles.sectionTitle, { color: theme.isDark ? Colors.sakhi.goldLight : Colors.sakhi.darker }]}>
              yourJars
            </TranslatedText>
          </View>
        </View>
        <View style={styles.jarsGrid}>
          {jarData.map((jar) => (
            <JarCard
              key={jar.name}
              name={jar.name}
              amount={jar.amount}
              icon={jar.icon}
              goal={jar.goal}
              onPress={() => navigation.navigate('Jars')}
              isVectorIcon={true}
            />
          ))}
        </View>

        {/* ── Fortune Tree Widget ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TreeWidget onPress={() => navigation.navigate('MainTabs', { screen: 'Tree' })} />
        </View>

        {/* ── Offline hint card ── */}
        <View style={[styles.offlineCard, { backgroundColor: theme.card }]}>
          <MaterialCommunityIcons name="cloud-off-outline" size={18} color={Colors.sakhi.teal} style={{ marginRight: 10 }} />
          <Text style={[styles.offlineHintText, { color: theme.textSub }]}>
            📱 {t('offlineHintText', lang)}
          </Text>
        </View>

      </ScrollView>

      {/* ── Modals ── */}
      <LifeEventModal
        event={lifeEvent}
        visible={showEvent}
        onDismiss={() => {
          setShowEvent(false);
          dispatch(dismissLifeEvent());
        }}
      />
      <DailyRewardModal
        visible={showDailyReward}
        onDismiss={() => setShowDailyReward(false)}
      />
    </View>
  );
}

// ── MissionRow component ─────────────────────────────────────────────────────
function MissionRow({
  id, icon, title, xpAmount, flameAmount, accentColor,
  done, onTime, onPress, isLast, theme,
}: {
  id: string; icon: any; title: string; xpAmount: number; flameAmount: number;
  accentColor: string; done: boolean; onTime: boolean; onPress: () => void;
  isLast: boolean; theme: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (done) {
      Animated.spring(shimmer, { toValue: 1, useNativeDriver: Platform.OS !== 'web', bounciness: 20, speed: 12 }).start();
    } else {
      shimmer.setValue(0);
    }
  }, [done]);

  const handlePress = () => {
    if (done) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', bounciness: 18, speed: 20 }),
    ]).start();
    onPress?.();
  };

  const isExpiredNotDone = !onTime && !done;
  const rowBg = done
    ? (accentColor + '12')
    : theme?.isDark ? 'transparent' : 'transparent';

  return (
    <View style={[
      styles.missionRow,
      { borderBottomColor: theme?.border || Colors.neutral.lightGray, backgroundColor: rowBg },
      isLast && { borderBottomWidth: 0 },
    ]}>
      {/* Accent left strip */}
      <View style={[styles.accentStrip, { backgroundColor: done ? accentColor : accentColor + '40' }]} />

      <View style={styles.missionLeft}>
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: accentColor + (done ? '25' : '18') }]}>
          {done
            ? <Feather name="check-circle" size={20} color={accentColor} />
            : <Feather name={icon} size={19} color={done ? accentColor : (theme?.isDark ? '#8899AA' : Colors.neutral.darkGray)} />
          }
        </View>

        {/* Text */}
        <View style={{ flex: 1, paddingRight: 8 }}>
          <TranslatedText style={[
            styles.missionTitle,
            { color: done ? accentColor : (theme?.text || Colors.neutral.darkGray) },
          ]}>
            {title}
          </TranslatedText>
          {isExpiredNotDone && (
            <Text style={{ fontSize: 10, color: Colors.feedback.danger, fontWeight: '700', marginTop: 2 }}>
              ⚠️ Time's up — 30% XP only
            </Text>
          )}
        </View>
      </View>

      {/* Rewards + CTA */}
      <View style={styles.missionRight}>
        <View style={styles.rewardPills}>
          <View style={[styles.pill, { backgroundColor: Colors.sakhi.green + '20' }]}>
            <Text style={[styles.pillText, { color: isExpiredNotDone ? Colors.neutral.gray : Colors.sakhi.green }]}>
              +{xpAmount} XP
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: Colors.sakhi.gold + '22', marginTop: 3 }]}>
            <MaterialCommunityIcons name="fire" size={11} color={isExpiredNotDone ? Colors.neutral.gray : Colors.sakhi.gold} style={{ marginRight: 2 }} />
            <Text style={[styles.pillText, { color: isExpiredNotDone ? Colors.neutral.gray : Colors.sakhi.gold }]}>
              +{flameAmount}
            </Text>
          </View>
        </View>

        {done ? (
          <Animated.View style={[styles.goBtn, {
            backgroundColor: accentColor + '25',
            borderColor: accentColor + '50',
            transform: [{ scale: shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] }) }],
          }]}>
            <Feather name="check" size={18} color={accentColor} />
          </Animated.View>
        ) : (
          <TouchableOpacity onPress={handlePress} activeOpacity={1}>
            <Animated.View style={[
              styles.goBtn,
              {
                backgroundColor: isExpiredNotDone ? Colors.neutral.gray + '80' : accentColor,
                borderColor: isExpiredNotDone ? Colors.neutral.gray : accentColor + 'CC',
                transform: [{ scale }],
              },
            ]}>
              <Text style={[styles.goBtnText, { color: isExpiredNotDone ? Colors.neutral.white : '#111' }]}>GO</Text>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 110 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Progress overview card (above missions)
  progressOverview: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.sakhi.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldLight + '60',
    backgroundColor: Colors.sakhi.goldLight + '18',
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '900',
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 4,
  },
  claimNowBanner: {
    marginTop: 10,
    backgroundColor: Colors.sakhi.goldLight + '22',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldLight + '60',
    alignItems: 'center',
  },
  claimNowText: {
    color: Colors.sakhi.goldLight,
    fontWeight: '900',
    fontSize: 13,
  },
  completeBanner: {
    marginTop: 10,
    backgroundColor: Colors.sakhi.green + '18',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.sakhi.green + '40',
    alignItems: 'center',
  },
  completeBannerText: {
    color: Colors.sakhi.green,
    fontWeight: '800',
    fontSize: 12,
  },

  // Missions card
  missionsCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 4,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    paddingRight: 16,
    borderBottomWidth: 1,
  },
  accentStrip: {
    width: 4,
    height: 44,
    borderRadius: 2,
    marginRight: 12,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  missionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardPills: {
    alignItems: 'flex-end',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  goBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  goBtnText: {
    fontSize: 12,
    fontWeight: '900',
  },

  // Jars grid
  jarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Offline hint
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.sakhi.teal + '30',
  },
  offlineHintText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
});
