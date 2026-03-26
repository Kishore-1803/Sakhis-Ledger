import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { completeFraudCase } from '../store/simulationSlice';
import { addXP, incrementStreak, completeDailyMission } from '../store/userSlice';
import GlobalHeader from '../components/GlobalHeader';
import TranslatedText from '../components/TranslatedText';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import { AudioEngine } from '../utils/audioEngine';
import { t, LanguageCode } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ScamBusterScreen() {
  const dispatch = useDispatch();
  const sim = useSelector((state: RootState) => state.simulation);
  const user = useSelector((state: RootState) => state.user);
  const lang = user.language as LanguageCode;
  const theme = useTheme();
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Flash overlay (Clash Royale correct/wrong effect)
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const [flashCorrect, setFlashCorrect] = useState(true);

  // Shake animation for wrong answer
  const shakeX = useRef(new Animated.Value(0)).current;

  const triggerFlash = (correct: boolean) => {
    setFlashCorrect(correct);
    flashOpacity.setValue(0.55);
    Animated.timing(flashOpacity, { toValue: 0, duration: 900, useNativeDriver: Platform.OS !== 'web' }).start();
    if (!correct) {
      // Shake left-right
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -12, duration: 60, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeX, { toValue: 12, duration: 60, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    }
  };

  // Rule-based engine: Filter available dynamically generated cases
  const availableCases = React.useMemo(() => {
    // If the activeScams array is empty, we fall back to an empty array
    // The Modal handles populating this on month advance
    return (sim.activeScams || []).filter((fc: any) => {
      // Hide if already completed
      if ((sim.completedFraudCases || []).includes(fc.id)) return false;
      return true;
    }).slice(0, 5);
  }, [sim.completedFraudCases, sim.activeScams]);

  const handleSelectCase = (fraudCase: any) => {
    setCurrentCase(fraudCase);
    setUserAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (isSafe: boolean) => {
    setUserAnswer(isSafe);
    setShowResult(true);
    
    const isCorrect = isSafe !== currentCase.isScam;
    triggerFlash(isCorrect);
    
    if (isCorrect) {
      dispatch(addXP(100));
    } else {
      dispatch(addXP(20));
    }

    if (currentCase) {
      dispatch(completeFraudCase(currentCase.id));
    }

    // Mark 'arena' daily mission done only when ALL active scams are completed
    const updatedFraudCases = [...(sim.completedFraudCases || []), currentCase.id];
    const allScamsDone =
      (sim.activeScams || []).length > 0 &&
      (sim.activeScams || []).every((fc: any) => updatedFraudCases.includes(fc.id));

    if (allScamsDone && !(user.dailyMissionsCompleted ?? []).includes('arena')) {
      const isOnTime = (user.dailyDeadline ?? 0) > 0 && Date.now() < (user.dailyDeadline ?? 0);
      const arenaBonus = isOnTime ? 100 : Math.floor(100 * 0.3);
      dispatch(addXP(arenaBonus));
      dispatch(completeDailyMission('arena'));
    }
  };

  const playAudio = (text: string) => {
    AudioEngine.play(text, lang);
  };

  const isCorrect = currentCase && userAnswer !== null ? userAnswer !== currentCase.isScam : false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Full-screen flash overlay (Clash Royale battle effect) */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: flashCorrect ? '#00CC55' : '#FF2222',
            opacity: flashOpacity,
            zIndex: 999,
          },
        ]}
      />
      <GlobalHeader title={t('scamBuster', lang)} audioText={'Arena. Test your knowledge on common frauds to earn rewards.'} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!currentCase && (
          <View style={styles.introBox}>
            <TranslatedText style={styles.subtitle} lang={lang}>
              {t('testScamSkills', lang)}
            </TranslatedText>
            <View style={[styles.rankBadge, {flexDirection: 'row', alignItems: 'center'}]}>
              <Feather name="award" size={14} color={Colors.neutral.darkGray} style={{ marginRight: 4 }} />
              <TranslatedText style={styles.rankText} lang={lang}>{`${t('rank', lang)}: Silver`}</TranslatedText>
            </View>
          </View>
        )}

        {/* Progress */}
        {!currentCase && (
          <View style={styles.progressBox}>
            <TranslatedText style={styles.progressText} lang={lang}>
              {`${sim.completedFraudCases?.length || 0} Total ${t('casesDefeated', lang)}`}
            </TranslatedText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `100%` }, // Abstract progress representation for endless mode
                ]}
              />
            </View>
          </View>
        )}

        {/* Fraud case list */}
        {!currentCase && (
          <View style={styles.casesGrid}>
            {availableCases.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Feather name="shield" size={48} color={Colors.sakhi.green} style={{ marginBottom: 12 }} />
                <TranslatedText style={{ textAlign: 'center', color: Colors.neutral.darkGray }} lang={lang}>
                  You have defeated all scams for this month! Check back later or level up to unlock more.
                </TranslatedText>
              </View>
            ) : (
              availableCases.map((fc: any) => {
                const isComplete = false; // We filtered them out, so they are not complete
                return (
                  <TouchableOpacity
                  key={fc.id}
                  style={[styles.caseCard, isComplete && styles.caseComplete]}
                  onPress={() => handleSelectCase(fc)}
                  activeOpacity={0.7}
                >
                  <Feather name={fc.type === 'sms' ? 'smartphone' : 'phone'} size={32} color={Colors.sakhi.goldLight} style={{marginBottom: 8}} />
                  <TranslatedText style={styles.caseTypeLabel} lang={lang}>{fc.type === 'sms' ? t('sms', lang) : t('call', lang)}</TranslatedText>
                  
                  {isComplete ? (
                    <Feather name="check-circle" size={18} color={Colors.sakhi.green} />
                  ) : (
                    <View style={styles.rewardPills}>
                      <Text style={styles.rewardXp}>+100 XP</Text>
                      <View style={[styles.rewardFlame, {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8}]}>
                        <Text style={{fontSize: 11, fontWeight: '700', color: Colors.sakhi.gold}}>+50</Text>
                        <MaterialCommunityIcons name="fire" size={12} color={Colors.sakhi.gold} />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }))}
          </View>
        )}

        {/* Active case */}
        {currentCase && !showResult && (
          <Animated.View style={[styles.activeCase, { transform: [{ translateX: shakeX }] }]}>
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Feather name={currentCase.type === 'sms' ? 'message-square' : 'phone-incoming'} size={20} color={Colors.sakhi.goldLight} style={{marginRight: 8}} />
                  <TranslatedText style={styles.messageLabel} lang={lang}>
                    {currentCase.type === 'sms' ? 'Incoming SMS' : 'Incoming Call'}
                  </TranslatedText>
                </View>
                <TouchableOpacity onPress={() => playAudio(currentCase.message)}>
                  <Feather name="volume-2" size={24} color={Colors.sakhi.goldLight} />
                </TouchableOpacity>
              </View>
              <TranslatedText style={styles.messageText} lang={lang}>{currentCase.message}</TranslatedText>
            </View>

            <TranslatedText style={styles.questionText} lang={lang}>Is this message SAFE or a SCAM?</TranslatedText>

            <View style={styles.answerRow}>
              <TouchableOpacity
                style={[styles.answerBtn, { backgroundColor: Colors.sakhi.green, borderBottomColor: Colors.sakhi.greenDark }]}
                onPress={() => handleAnswer(true)}
              >
                <Feather name="check-circle" size={32} color={Colors.neutral.white} style={{marginBottom: 6}} />
                <TranslatedText style={styles.answerText} lang={lang}>Safe</TranslatedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerBtn, { backgroundColor: Colors.feedback.danger, borderBottomColor: '#A93226' }]}
                onPress={() => handleAnswer(false)}
              >
                <Feather name="alert-triangle" size={32} color={Colors.neutral.white} style={{marginBottom: 6}} />
                <TranslatedText style={styles.answerText} lang={lang}>Scam!</TranslatedText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCurrentCase(null)}>
               <TranslatedText style={styles.cancelBtnText} lang={lang}>Back</TranslatedText>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Result */}
        {showResult && currentCase && (
          <View style={styles.resultCard}>
            <Feather name={isCorrect ? 'award' : 'alert-circle'} size={56} color={isCorrect ? Colors.sakhi.green : Colors.feedback.danger} style={{marginBottom: 12}} />
            <TranslatedText style={[styles.resultTitle, { color: isCorrect ? Colors.sakhi.green : Colors.feedback.danger }]} lang={lang}>
              {isCorrect ? 'Correct! +100 XP' : 'Oops! +20 XP'}
            </TranslatedText>
            <TranslatedText style={styles.resultStatus} lang={lang}>
              {`This was: ${currentCase.isScam ? 'A SCAM' : 'SAFE'}`}
            </TranslatedText>
            <TranslatedText style={styles.resultExplanation} lang={lang}>{currentCase.explanation}</TranslatedText>

            {currentCase.isScam && currentCase.redFlags?.length > 0 && (
              <View style={styles.redFlagsBox}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <Feather name="flag" size={14} color={Colors.feedback.danger} style={{marginRight: 4}} />
                  <TranslatedText style={[styles.redFlagsTitle, {marginBottom: 0}]} lang={lang}>Red Flags to Watch For:</TranslatedText>
                </View>
                {currentCase.redFlags.map((flag: string, i: number) => (
                  <TranslatedText key={i} style={styles.redFlag} lang={lang}>{`� ${flag}`}</TranslatedText>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setCurrentCase(null);
                setShowResult(false);
                setUserAnswer(null);
              }}
            >
              <TranslatedText style={styles.doneBtnText} lang={lang}>? Back to Arena</TranslatedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  introBox: {
    backgroundColor: Colors.sakhi.navy,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: Colors.sakhi.goldLight,
    marginRight: 10,
  },
  rankBadge: {
    backgroundColor: Colors.sakhi.goldLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
  },
  progressBox: {
    backgroundColor: Colors.sakhi.navy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  progressText: {
    fontSize: 15,
    color: Colors.sakhi.goldLight,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.sakhi.goldDark,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sakhi.green,
    borderRadius: 4,
  },
  casesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  caseCard: {
    backgroundColor: Colors.sakhi.navy,
    width: '47%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderTopWidth: 5,
    borderTopColor: Colors.feedback.danger,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '30',
  },
  caseComplete: {
    opacity: 0.6,
    borderTopColor: Colors.sakhi.green,
  },
  caseIconEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  caseTypeLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.neutral.white,
    marginBottom: 8,
  },
  rewardPills: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardXp: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.sakhi.green,
    backgroundColor: Colors.sakhi.green + '25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rewardFlame: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.sakhi.gold,
    backgroundColor: Colors.sakhi.gold + '25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completedMark: {
    fontSize: 18,
  },
  activeCase: {
    marginTop: 10,
  },
  messageCard: {
    backgroundColor: Colors.sakhi.navy,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sakhi.goldDark + '30',
    paddingBottom: 12,
  },
  messageIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  messageLabel: {
    fontSize: 14,
    color: Colors.sakhi.goldLight,
    fontWeight: '800',
  },
  messageText: {
    fontSize: 16,
    color: '#E0E8F0',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  answerBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  answerEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.neutral.white,
  },
  cancelBtn: {
    alignItems: 'center',
    padding: 12,
  },
  cancelBtnText: {
    color: Colors.neutral.gray,
    fontWeight: '700',
    fontSize: 16,
  },
  resultCard: {
    backgroundColor: Colors.sakhi.navy,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.white,
    marginBottom: 12,
  },
  resultExplanation: {
    fontSize: 15,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  redFlagsBox: {
    backgroundColor: '#3D1414',
    borderWidth: 2,
    borderColor: '#E74C3C60',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  redFlagsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.feedback.danger,
    marginBottom: 8,
  },
  redFlag: {
    fontSize: 14,
    color: '#FF9999',
    lineHeight: 22,
    marginLeft: 4,
    fontWeight: '500',
  },
  doneBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.sakhi.green,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.sakhi.greenDark,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.neutral.white,
  },
});
