import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Colors } from '../constants/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { LifeEvent } from '../engine/lifeEvents';
import { t, LanguageCode } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface LifeEventModalProps {
  event: LifeEvent | null;
  visible: boolean;
  onDismiss: () => void;
}

const severityConfig: Record<string, { icon: any; color: string; bg: string }> = {
  low:    { icon: 'info',          color: Colors.feedback.info,    bg: Colors.feedback.info + '18' },
  medium: { icon: 'alert-triangle', color: Colors.feedback.warning, bg: Colors.feedback.warning + '15' },
  high:   { icon: 'alert-octagon', color: Colors.feedback.danger,  bg: Colors.feedback.danger + '15' },
};

// Jar emoji map for visual impact
const jarEmoji: Record<string, string> = {
  household: '🏠',
  children:  '👧',
  savings:   '💰',
  emergency: '🚨',
};

export default function LifeEventModal({ event, visible, onDismiss }: LifeEventModalProps) {
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode);
  const { lastEventJarDeducted, lastEventBalanceDeducted } = useSelector(
    (state: RootState) => state.simulation
  );

  if (!event) return null;

  const sev        = severityConfig[event.severity] || severityConfig.medium;
  const isPositive = event.impact.amount > 0;
  const totalHit   = Math.abs(event.impact.amount);
  const jarName    = event.impact.jar;
  const jarEmoji_  = jarEmoji[jarName] || '🏦';

  // Was there a balance penalty? It means the jar didn't have enough savings.
  const hadEnoughInJar = lastEventBalanceDeducted === 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { borderColor: sev.color + '60' }]}>

          {/* Header icon */}
          <View style={[styles.iconCircle, { backgroundColor: sev.bg }]}>
            <Feather name={sev.icon} size={40} color={sev.color} />
          </View>

          <Text style={[styles.label, { color: sev.color }]}>
            {isPositive ? '🎉 Bonus Income!' : '⚠️ Life Event!'}
          </Text>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* ── Financial Impact ─────────────────────────────────────────── */}
          {isPositive ? (
            // Windfall — simple positive display
            <View style={[styles.impactCard, { backgroundColor: Colors.sakhi.green + '18', borderColor: Colors.sakhi.green + '40' }]}>
              <MaterialCommunityIcons name="cash-plus" size={22} color={Colors.sakhi.green} style={{ marginRight: 8 }} />
              <Text style={[styles.impactText, { color: Colors.sakhi.green }]}>
                +₹{totalHit.toLocaleString('en-IN')} → {jarEmoji_} {jarName} Jar
              </Text>
            </View>
          ) : (
            // Expense — show jar hit + balance hit breakdown
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownTitle}>💸 Financial Impact</Text>

              {/* Jar deduction */}
              <View style={[styles.breakdownRow, { backgroundColor: lastEventJarDeducted > 0 ? Colors.feedback.warning + '18' : Colors.neutral.lightGray + '20' }]}>
                <Text style={styles.breakdownIcon}>{jarEmoji_}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.breakdownLabel}>
                    {jarName.charAt(0).toUpperCase() + jarName.slice(1)} Jar
                  </Text>
                  <Text style={[styles.breakdownAmount, { color: lastEventJarDeducted > 0 ? Colors.feedback.warning : Colors.neutral.gray }]}>
                    {lastEventJarDeducted > 0
                      ? `-₹${lastEventJarDeducted.toLocaleString('en-IN')}`
                      : 'Empty — nothing saved here'}
                  </Text>
                </View>
                {lastEventJarDeducted > 0 && (
                  <Text style={styles.checkOrX}>✅</Text>
                )}
              </View>

              {/* Balance deduction (penalty for not saving) */}
              {lastEventBalanceDeducted > 0 && (
                <View style={[styles.breakdownRow, { backgroundColor: Colors.feedback.danger + '18' }]}>
                  <Text style={styles.breakdownIcon}>💳</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownLabel}>Available Balance</Text>
                    <Text style={[styles.breakdownAmount, { color: Colors.feedback.danger }]}>
                      -₹{lastEventBalanceDeducted.toLocaleString('en-IN')} (jar was empty!)
                    </Text>
                  </View>
                  <Text style={styles.checkOrX}>❌</Text>
                </View>
              )}

              {/* Lesson text */}
              <View style={[styles.lessonBox, { backgroundColor: hadEnoughInJar ? Colors.sakhi.green + '18' : Colors.feedback.danger + '12' }]}>
                <MaterialCommunityIcons
                  name={hadEnoughInJar ? 'lightbulb-on' : 'alert-circle'}
                  size={16}
                  color={hadEnoughInJar ? Colors.sakhi.green : Colors.feedback.danger}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.lessonText, { color: hadEnoughInJar ? Colors.sakhi.green : Colors.feedback.danger }]}>
                  {hadEnoughInJar
                    ? `Your ${jarName} savings covered this! Great planning.`
                    : `No savings in ${jarName} jar → balance deducted. Save more next month!`}
                </Text>
              </View>
            </View>
          )}

          {/* XP Reward */}
          {!isPositive && (
            <View style={styles.xpRewardRow}>
              <Text style={styles.xpRewardText}>⭐ +{event.xpReward} XP earned for facing this event!</Text>
            </View>
          )}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Cost:</Text>
            <Text style={[styles.totalAmount, { color: isPositive ? Colors.sakhi.green : Colors.feedback.danger }]}>
              {isPositive ? '+' : '-'}₹{totalHit.toLocaleString('en-IN')}
            </Text>
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: sev.color }]} onPress={onDismiss}>
            <Text style={styles.buttonText}>I Understand 👍</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.neutral.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },

  // Positive windfall
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    width: '100%',
  },
  impactText: {
    fontSize: 16,
    fontWeight: '900',
  },

  // Expense breakdown
  breakdownBox: {
    width: '100%',
    marginBottom: 14,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    gap: 8,
  },
  breakdownIcon: {
    fontSize: 20,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.neutral.white,
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  checkOrX: {
    fontSize: 16,
  },
  lessonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  lessonText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    lineHeight: 17,
  },

  // Total row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '900',
  },

  button: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.28)',
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.neutral.white,
    fontSize: 15,
    fontWeight: '900',
  },
  xpRewardRow: {
    backgroundColor: Colors.sakhi.goldLight + '18',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sakhi.goldLight + '35',
  },
  xpRewardText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.sakhi.goldLight,
  },
});
