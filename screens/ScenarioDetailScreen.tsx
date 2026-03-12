import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { completeScenario } from '../store/simulationSlice';
import { addXP, incrementStreak } from '../store/userSlice';
import { behavioralLogger } from '../engine/behavioralLogger';
import { Colors } from '../constants/theme';
import { AudioEngine } from '../utils/audioEngine';
import { t, LanguageCode } from '../utils/i18n';
import TranslatedText from '../components/TranslatedText';
import { useDynamicTranslation } from '../utils/translate';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


interface ScenarioDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ScenarioDetailScreen({ route, navigation }: ScenarioDetailScreenProps) {
  const dispatch = useDispatch();
  const sim = useSelector((state: RootState) => state.simulation);
  const { language } = useSelector((state: RootState) => state.user);
  const lang = language as string;

  const { scenarioId } = route.params;
  const scenario = (sim.activeScenarios || []).find((s: any) => s.id === scenarioId) as any;

  const [selectedChoice, setSelectedChoice] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const translatedNarrative = useDynamicTranslation(scenario?.narrative || '', lang);
  const translatedFeedback = useDynamicTranslation(selectedChoice?.impact?.feedback || '', lang);

  if (!scenario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Scenario not found</Text>
      </SafeAreaView>
    );
  }

  const isCompleted = sim.completedScenarios.includes(scenario.id);

  const handleChoice = (choice: any) => {
    setSelectedChoice(choice);
    setShowResult(true);

    behavioralLogger.log('choice_made', { scenarioId, choiceId: choice.id });
    if (choice.isOptimal) {
      behavioralLogger.log('optimal_choice', { scenarioId, choiceId: choice.id });
      dispatch(incrementStreak());
    }

    const xp = choice.impact.xpReward || 50;
    
    dispatch(addXP(xp));
    dispatch(
      completeScenario({
        scenarioId: scenario.id,
        isOptimal: choice.isOptimal,
        finHealthDelta: choice.impact.finHealth || 0,
      })
    );
  };

  const playAudio = () => {
    AudioEngine.play(translatedNarrative, language);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Match iOS Style */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="arrow-left" size={20} color={Colors.neutral.white} style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={playAudio}>
          <Feather name="volume-2" size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Scenario header */}
        <View style={styles.headerCard}>
          <TranslatedText text={scenario.title} lang={lang} style={styles.title} />
          <View style={styles.divider} />
          <Text style={styles.narrative}>{translatedNarrative}</Text>
        </View>

        {/* Choices */}
        {!showResult && !isCompleted && (
          <View>
            <Text style={styles.choicePrompt}>{t('whatWillYouDo', lang)}</Text>
            {scenario.choices.map((choice: any) => (
              <TouchableOpacity
                key={choice.id}
                style={styles.choiceCard}
                onPress={() => handleChoice(choice)}
                activeOpacity={0.7}
              >
                <TranslatedText text={choice.text} lang={lang} style={styles.choiceText} />
                <View style={styles.choiceRight}>
                   <Feather name="arrow-right" size={20} color={Colors.sakhi.green} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Already completed */}
        {isCompleted && !showResult && (
          <View style={styles.completedCard}>
            <Feather name="check-circle" size={48} color={Colors.sakhi.green} style={{ marginBottom: 12 }} />
            <Text style={styles.completedTitle}>Quest Completed!</Text>
            <Text style={styles.completedSub}>
              You've already conquered this mission. Look for new daily missions tomorrow!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Result Modal */}
      <Modal visible={showResult} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.resultModal}>
            <View style={{ marginBottom: 16 }}>
              {selectedChoice?.isOptimal ? (
                 <MaterialCommunityIcons name="party-popper" size={56} color={Colors.sakhi.gold} />
              ) : (
                 <MaterialCommunityIcons name="lightbulb-on" size={56} color={Colors.sakhi.blue} />
              )}
            </View>
            <Text style={styles.resultTitle}>
              {selectedChoice?.isOptimal ? 'Mission Success!' : 'Learning Moment'}
            </Text>
            <Text style={styles.resultFeedback}>{translatedFeedback}</Text>

            <View style={styles.rewardsBox}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardVal}>+{selectedChoice?.impact?.xpReward || 50}</Text>
                <Text style={styles.rewardLbl}>XP Earned</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.rewardVal}>+{Math.floor((selectedChoice?.impact?.xpReward || 50) / 2)}</Text>
                  <MaterialCommunityIcons name="fire" size={20} color={Colors.sakhi.gold} />
                </View>
                <Text style={styles.rewardLbl}>Streak</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                setShowResult(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.doneBtnText}>Claim Rewards</Text>
              <Feather name="arrow-right" size={18} color={Colors.neutral.white} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.offWhite,
  },
  topBar: {
    backgroundColor: Colors.sakhi.green,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtnText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
  },
  audioIcon: {
    fontSize: 24,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginBottom: 16,
  },
  narrative: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  choicePrompt: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 14,
  },
  choiceCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  choiceText: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral.darkGray,
    lineHeight: 22,
    fontWeight: '500',
  },
  choiceRight: {
    marginLeft: 12,
    alignItems: 'center',
  },
  choiceArrow: {
    fontSize: 20,
    color: Colors.sakhi.gold,
  },
  completedCard: {
    backgroundColor: Colors.sakhi.green + '15',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.sakhi.green + '30',
  },
  completedEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.sakhi.green,
    marginBottom: 4,
  },
  completedSub: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.neutral.darkGray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  resultModal: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  resultFeedback: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  rewardsBox: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 16,
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.sakhi.green + '30',
  },
  rewardItem: {
    alignItems: 'center',
    flex: 1,
  },
  rewardVal: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.sakhi.green,
  },
  rewardLbl: {
    fontSize: 12,
    color: Colors.neutral.gray,
    fontWeight: '700',
    marginTop: 4,
  },
  rewardDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral.lightGray,
  },
  doneBtn: {
    backgroundColor: Colors.sakhi.green,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
});
