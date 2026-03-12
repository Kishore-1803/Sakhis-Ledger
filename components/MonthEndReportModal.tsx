import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { markMonthReportShown, advanceMonth, setActiveContent } from '../store/simulationSlice';
import { addXP } from '../store/userSlice';
import { generateDynamicFraudCases, generateDynamicScenarios } from '../engine/contentGenerator';
import { Colors } from '../constants/theme';
import { t, LanguageCode } from '../utils/i18n';
import { AudioEngine } from '../utils/audioEngine';
import TranslatedText from './TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDynamicTranslation } from '../utils/translate';

interface MonthEndReportModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function MonthEndReportModal({ visible, onDismiss }: MonthEndReportModalProps) {
  const dispatch = useDispatch();
  const sim = useSelector((state: RootState) => state.simulation);
  const user = useSelector((state: RootState) => state.user);
  const lang = user.language as LanguageCode;

  const handleClaim = () => {
    dispatch(addXP(500)); // Monthly completion bonus
    dispatch(markMonthReportShown(sim.month));
    dispatch(advanceMonth());
    
    // Generate new dynamic procedural content for the new month based on the updated level!
    const newScams = generateDynamicFraudCases(user.level, 5);
    const newScenarios = generateDynamicScenarios(user.level, 5);
    dispatch(setActiveContent({ scams: newScams, scenarios: newScenarios }));
    
    onDismiss();
  };

  const translatedAudioText = useDynamicTranslation('Month end report. Great job managing your finances this month!', lang);

  const playAudio = () => {
    AudioEngine.play(translatedAudioText, lang);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
            <Feather name='volume-2' size={24} color={Colors.neutral.darkGray} />
          </TouchableOpacity>

          <Feather name='calendar' size={48} color={Colors.sakhi.darker} style={{ marginBottom: 16 }} />
          <TranslatedText text="Month Complete!" lang={lang} style={styles.title} />
          <TranslatedText text='End of Month Report' lang={lang} style={styles.subtitle} />

          <View style={styles.statsBox}>
            <View style={styles.statRow}>
              <TranslatedText text='Total Saved' lang={lang} style={styles.statLabel} />
              <Text style={styles.statValue}>₹{sim.jars.savings}</Text>
            </View>
            <View style={styles.statRow}>
              <TranslatedText text='Missions Completed' lang={lang} style={styles.statLabel} />
              <Text style={styles.statValue}>{sim.completedScenarios.length}</Text>
            </View>
            <View style={styles.statRow}>
              <TranslatedText text='Scams Defeated' lang={lang} style={styles.statLabel} />
              <Text style={styles.statValue}>{sim.completedFraudCases.length}</Text>
            </View>
          </View>

          <View style={styles.rewardsBox}>
            <TranslatedText text='Monthly Rewards' lang={lang} style={styles.rewardsTitle} />
            <View style={{flexDirection:'row', alignItems:'center'}}><Text style={styles.rewardText}>+500 XP </Text><MaterialCommunityIcons name='party-popper' size={24} color='#D97706' /></View>
          </View>

          <TouchableOpacity style={styles.claimBtn} onPress={handleClaim}>
            <TranslatedText text='Claim and Start New Month' lang={lang} style={styles.claimText} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  audioBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  emojiContent: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.sakhi.darker,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    fontWeight: '700',
    marginBottom: 24,
  },
  statsBox: {
    width: '100%',
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: Colors.neutral.darkGray,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.sakhi.green,
  },
  rewardsBox: {
    backgroundColor: Colors.sakhi.gold + '20',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.sakhi.gold + '50',
  },
  rewardsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D97706',
  },
  claimBtn: {
    backgroundColor: Colors.sakhi.green,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  claimText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
