import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { completeFraudCase } from '../store/simulationSlice';
import { addXP, incrementStreak } from '../store/userSlice';
import GlobalHeader from '../components/GlobalHeader';
import TranslatedText from '../components/TranslatedText';
import { Colors } from '../constants/theme';
import { AudioEngine } from '../utils/audioEngine';
import { t, LanguageCode } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ScamBusterScreen() {
  const dispatch = useDispatch();
  const sim = useSelector((state: RootState) => state.simulation);
  const user = useSelector((state: RootState) => state.user);
  const lang = user.language as LanguageCode;
  const [currentCase, setCurrentCase] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Rule-based engine: Filter available dynamically generated cases
  const availableCases = React.useMemo(() => {
    // If the activeScams array is empty, we fall back to an empty array
    // The Modal handles populating this on month advance
    return (sim.activeScams || []).filter((fc: any) => {
      // Hide if already completed
      if (sim.completedFraudCases.includes(fc.id)) return false;
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
    
    // Check correctness
    const isCorrect = isSafe !== currentCase.isScam;
    
    if (isCorrect) {
      dispatch(addXP(100)); // Flat 100 XP for learning Scam detection
      dispatch(incrementStreak());
    } else {
      dispatch(addXP(20)); // Consolation XP for trying
    }

    if (currentCase) {
      dispatch(completeFraudCase(currentCase.id));
    }
  };

  const playAudio = (text: string) => {
    AudioEngine.play(text, lang);
  };

  const isCorrect = currentCase && userAnswer !== null ? userAnswer !== currentCase.isScam : false;

  return (
    <SafeAreaView style={styles.container}>
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
              {`${sim.completedFraudCases.length} Total ${t('casesDefeated', lang)}`}
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
                  <Feather name={fc.type === 'sms' ? 'smartphone' : 'phone'} size={32} color={Colors.neutral.darkGray} style={{marginBottom: 8}} />
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
          <View style={styles.activeCase}>
            <View style={styles.messageCard}>
              <View style={styles.messageHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Feather name={currentCase.type === 'sms' ? 'message-square' : 'phone-incoming'} size={20} color={Colors.neutral.darkGray} style={{marginRight: 8}} />
                  <TranslatedText style={styles.messageLabel} lang={lang}>
                    {currentCase.type === 'sms' ? 'Incoming SMS' : 'Incoming Call'}
                  </TranslatedText>
                </View>
                <TouchableOpacity onPress={() => playAudio(currentCase.message)}>
                  <Feather name="volume-2" size={24} color={Colors.neutral.darkGray} />
                </TouchableOpacity>
              </View>
              <TranslatedText style={styles.messageText} lang={lang}>{currentCase.message}</TranslatedText>
            </View>

            <TranslatedText style={styles.questionText} lang={lang}>Is this message SAFE or a SCAM?</TranslatedText>

            <View style={styles.answerRow}>
              <TouchableOpacity
                style={[styles.answerBtn, { backgroundColor: Colors.sakhi.green }]}
                onPress={() => handleAnswer(true)}
              >
                <Feather name="check-circle" size={32} color={Colors.neutral.white} style={{marginBottom: 6}} />
                <TranslatedText style={styles.answerText} lang={lang}>Safe</TranslatedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.answerBtn, { backgroundColor: Colors.feedback.danger }]}
                onPress={() => handleAnswer(false)}
              >
                <Feather name="alert-triangle" size={32} color={Colors.neutral.white} style={{marginBottom: 6}} />
                <TranslatedText style={styles.answerText} lang={lang}>Scam!</TranslatedText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCurrentCase(null)}>
               <TranslatedText style={styles.cancelBtnText} lang={lang}>Back</TranslatedText>
            </TouchableOpacity>
          </View>
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

            {currentCase.isScam && currentCase.redFlags.length > 0 && (
              <View style={styles.redFlagsBox}>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                  <Feather name="flag" size={14} color={Colors.feedback.danger} style={{marginRight: 4}} />
                  <TranslatedText style={[styles.redFlagsTitle, {marginBottom: 0}]} lang={lang}>Red Flags to Watch For:</TranslatedText>
                </View>
                {currentCase.redFlags.map((flag: string, i: number) => (
                  <TranslatedText key={i} style={styles.redFlag} lang={lang}>{`• ${flag}`}</TranslatedText>
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
              <TranslatedText style={styles.doneBtnText} lang={lang}>← Back to Arena</TranslatedText>
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
    backgroundColor: Colors.neutral.offWhite,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  introBox: {
    backgroundColor: Colors.neutral.white,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
    marginRight: 10,
  },
  rankBadge: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
  },
  progressBox: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    color: Colors.sakhi.green,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
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
    backgroundColor: Colors.neutral.white,
    width: '47%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderTopWidth: 4,
    borderTopColor: '#FECACA', // Light red indication for scam
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
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 8,
  },
  rewardPills: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardXp: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.sakhi.green,
    backgroundColor: Colors.sakhi.green + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rewardFlame: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.sakhi.gold,
    backgroundColor: Colors.sakhi.gold + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedMark: {
    fontSize: 18,
  },
  activeCase: {
    marginTop: 10,
  },
  messageCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
    paddingBottom: 12,
  },
  messageIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  messageLabel: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: '800',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.sakhi.darker,
    textAlign: 'center',
    marginBottom: 16,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  answerBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  answerEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '800',
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
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 12,
  },
  resultExplanation: {
    fontSize: 15,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  redFlagsBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: '#991B1B',
    lineHeight: 22,
    marginLeft: 4,
    fontWeight: '500',
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: Colors.sakhi.green,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
});
