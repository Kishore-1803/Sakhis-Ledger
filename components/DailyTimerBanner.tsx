import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Colors } from '../constants/theme';
import Feather from '@expo/vector-icons/Feather';
import { useDynamicTranslation } from '../utils/translate';
import { LanguageCode } from '../utils/i18n';
function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return '00:00:00';
  const totalSecs = Math.floor(msLeft / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const TOTAL_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

export default function DailyTimerBanner() {
  const deadline = useSelector((state: RootState) => state.user.dailyDeadline) ?? 0;
  const completed: string[] = useSelector((state: RootState) => state.user.dailyMissionsCompleted) ?? [];
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode) || 'en';
  const [now, setNow] = useState(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const msLeft = deadline > 0 ? Math.max(0, deadline - now) : 0;
  const isExpired = deadline > 0 && msLeft === 0;
  const isUrgent = msLeft > 0 && msLeft < 30 * 60 * 1000; // < 30 min
  const progress = deadline > 0 ? Math.max(0, msLeft / TOTAL_WINDOW_MS) : 1;

  // Urgent pulse animation
  useEffect(() => {
    if (!isUrgent) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isUrgent]);

  if (deadline === 0) return null;

  const barColor = isExpired ? Colors.neutral.gray
    : isUrgent ? Colors.feedback.danger
    : Colors.sakhi.green;

  const bgColor = isExpired ? 'rgba(0,0,0,0.25)'
    : isUrgent ? 'rgba(231,76,60,0.15)'
    : 'rgba(46,204,113,0.12)';

  const timesUpText = useDynamicTranslation("Time's up! Full XP locked for today.", lang);
  const hurryText = useDynamicTranslation("Hurry!", lang);
  const leftText = useDynamicTranslation("left", lang);
  const dailyWindowText = useDynamicTranslation("Daily window:", lang);
  const doneText = useDynamicTranslation("done", lang);

  const displayLabel = isExpired
    ? timesUpText
    : isUrgent
    ? `⚡ ${hurryText} ${formatCountdown(msLeft)} ${leftText}`
    : `⏳ ${dailyWindowText} ${formatCountdown(msLeft)}`;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, transform: [{ scale: isUrgent ? pulseAnim : 1 }] }]}>
      <View style={styles.row}>
        <Feather
          name={isExpired ? 'clock' : 'zap'}
          size={14}
          color={barColor}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.label, { color: barColor }]}>{displayLabel}</Text>        
        <Text style={[styles.count, { color: barColor }]}>
          {completed.length}/4 {doneText}
        </Text>
      </View>
      {/* Progress bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: barColor }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  count: {
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
