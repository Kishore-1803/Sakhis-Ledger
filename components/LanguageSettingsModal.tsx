import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Switch, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setLanguage, setGuide, toggleDarkMode } from '../store/userSlice';
import { useSession } from '../utils/SessionContext';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import { t, LanguageCode, LANGUAGES } from '../utils/i18n';
import TranslatedText from './TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface LanguageSettingsModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function LanguageSettingsModal({ visible, onDismiss }: LanguageSettingsModalProps) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode);
  const { name, level, xp, streak, trophies, isDarkMode, guide } = useSelector((state: RootState) => state.user);
  const sim = useSelector((state: RootState) => state.simulation);
  const { onLogout } = useSession();

  const handleLangSelect = (code: string) => {
    dispatch(setLanguage(code));
    onDismiss();
  };

  const handleLogout = () => {
    Alert.alert(
      'Switch Player',
      'Go back to the player selection screen? Your progress is saved automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch Player',
          style: 'destructive',
          onPress: () => {
            onDismiss();
            // switchUserProfile + navigation reset is handled by SessionContext's onLogout
            onLogout();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Feather name="settings" size={22} color={Colors.sakhi.goldLight} style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>
            </View>

            {/* User Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.isDark ? '#0A3020' : Colors.sakhi.green }]}>
              <View style={styles.avatarRing}>
                <Text style={{ fontSize: 28 }}>{guide === 'savitri' ? '👩' : '👵'}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.profileName}>{name || 'Sakhi'}</Text>
                <Text style={styles.profileSub}>{guide === 'savitri' ? 'Savitri Didi' : 'Shanti Didi'} • Level {level}</Text>
              </View>
              <View style={styles.profileStats}>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons name="star-four-points" size={12} color={Colors.sakhi.gold} />
                  <Text style={styles.statPillText}>{xp} XP</Text>
                </View>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons name="fire" size={12} color={Colors.sakhi.coral} />
                  <Text style={styles.statPillText}>{streak}</Text>
                </View>
                <View style={styles.statPill}>
                  <MaterialCommunityIcons name="trophy" size={12} color={Colors.sakhi.gold} />
                  <Text style={styles.statPillText}>{trophies}</Text>
                </View>
              </View>
            </View>

            {/* Quick Stats Row */}
            <View style={[styles.statsRow, { backgroundColor: theme.surface }]}>
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatNum, { color: Colors.sakhi.green }]}>{sim.completedScenarios?.length || 0}</Text>
                <Text style={[styles.quickStatLabel, { color: theme.textSub }]}>Quests</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatNum, { color: Colors.feedback.danger }]}>{sim.completedFraudCases?.length || 0}</Text>
                <Text style={[styles.quickStatLabel, { color: theme.textSub }]}>Scams Beat</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatNum, { color: Colors.sakhi.gold }]}>₹{((sim.jars?.savings || 0) / 1000).toFixed(1)}k</Text>
                <Text style={[styles.quickStatLabel, { color: theme.textSub }]}>Saved</Text>
              </View>
              <View style={[styles.quickStatDivider, { backgroundColor: theme.border }]} />
              <View style={styles.quickStat}>
                <Text style={[styles.quickStatNum, { color: Colors.sakhi.blue }]}>{sim.finHealthScore}</Text>
                <Text style={[styles.quickStatLabel, { color: theme.textSub }]}>Health</Text>
              </View>
            </View>

            {/* Dark Mode Toggle */}
            <View style={[styles.toggleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name={isDarkMode ? 'moon' : 'sun'} size={18} color={isDarkMode ? '#9B59B6' : Colors.sakhi.gold} style={{ marginRight: 10 }} />
                <Text style={[styles.toggleLabel, { color: theme.text }]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(_val: boolean) => { dispatch(toggleDarkMode()); }}
                trackColor={{ false: Colors.neutral.lightGray, true: Colors.sakhi.purple + '80' }}
                thumbColor={isDarkMode ? Colors.sakhi.purple : Colors.neutral.gray}
              />
            </View>

            {/* Guide Switcher */}
            <Text style={[styles.sectionText, { color: theme.textSub }]}>Your Guide (Didi)</Text>
            <View style={styles.guideRow}>
              {[
                {
                  id: 'savitri' as const,
                  emoji: '👩',
                  name: 'Savitri Didi',
                  desc: 'Budget & Savings expert',
                },
                {
                  id: 'shanti' as const,
                  emoji: '👵',
                  name: 'Shanti Didi',
                  desc: 'Fraud protection expert',
                },
              ].map((g) => {
                const active = guide === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.guideCard,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      active && styles.guideCardActive,
                    ]}
                    onPress={() => dispatch(setGuide(g.id))}
                  >
                    <Text style={styles.guideEmoji}>{g.emoji}</Text>
                    <Text style={[styles.guideName, { color: active ? Colors.sakhi.goldLight : theme.text }]}>
                      {g.name}
                    </Text>
                    <Text style={[styles.guideDesc, { color: theme.textSub }]}>{g.desc}</Text>
                    {active && (
                      <View style={styles.activeChip}>
                        <Text style={styles.activeChipText}>Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.guideNote, { color: theme.textSub }]}>
              💡 Switching guides keeps all your XP, jars and tree progress — you learn from both!
            </Text>

            {/* Language Section */}
            <Text style={[styles.sectionText, { color: theme.textSub }]}>Language</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, { backgroundColor: theme.surface }, lang === l.code && styles.langBtnActive]}
                  onPress={() => handleLangSelect(l.code)}
                >
                  <Text style={[styles.langLabel, { color: theme.text }, lang === l.code && { color: Colors.sakhi.goldLight }]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={Colors.sakhi.coral} style={{ marginRight: 8 }} />
              <Text style={styles.logoutBtnText}>Switch Player</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.surface }]} onPress={onDismiss}>
              <Text style={[styles.closeBtnText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    borderTopWidth: 3,
    borderTopColor: Colors.sakhi.goldLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.sakhi.goldLight,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileSub: {
    fontSize: 12,
    color: Colors.sakhi.goldLight,
    marginTop: 2,
    fontWeight: '600',
  },
  profileStats: {
    gap: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.sakhi.goldLight,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sakhi.goldDark + '30',
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNum: {
    fontSize: 18,
    fontWeight: '900',
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 2,
    height: 32,
    backgroundColor: Colors.sakhi.goldDark + '30',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionText: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  langBtn: {
    width: '48%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  langBtnActive: {
    borderColor: Colors.sakhi.goldLight,
  },
  langLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#3D141420',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.feedback.danger + '40',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.feedback.danger,
  },
  closeBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },

  // ── Guide Switcher ────────────────────────────────────────────────────────
  guideRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  guideCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  guideCardActive: {
    borderColor: Colors.sakhi.goldLight,
    backgroundColor: Colors.sakhi.green + '20',
  },
  guideEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  guideName: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  guideDesc: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  activeChip: {
    backgroundColor: Colors.sakhi.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeChipText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A1A2E',
  },
  guideNote: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
});


