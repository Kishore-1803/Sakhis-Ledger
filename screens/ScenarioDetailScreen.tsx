import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { completeScenario } from '../store/simulationSlice';
import { addXP, incrementStreak, completeDailyMission } from '../store/userSlice';
import { waterTree } from '../store/engagementSlice';
import { behavioralLogger } from '../engine/behavioralLogger';
import { Colors } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
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
  const { language, dailyMissionsCompleted, dailyDeadline } = useSelector((state: RootState) => state.user);
  const lang = language as string;
  const theme = useTheme();

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

  const isCompleted = (sim.completedScenarios || []).includes(scenario.id);

  const handleChoice = (choice: any) => {
    setSelectedChoice(choice);
    setShowResult(true);

    behavioralLogger.log('choice_made', { scenarioId, choiceId: choice.id });
    if (choice.isOptimal) {
      behavioralLogger.log('optimal_choice', { scenarioId, choiceId: choice.id });
      // Note: streak is day-based; it increments in setDailyDeadline on new-day opens,
      // NOT on each optimal choice (that would inflate it and award badges incorrectly).
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

    // Water the Fortune Tree — completing quests grows the tree
    dispatch(waterTree(choice.isOptimal ? 15 : 8));

    // Mark 'quest' mission done only when ALL active scenarios are completed
    const updatedCompleted = [...(sim.completedScenarios || []), scenario.id];
    const allScenariosDone =
      (sim.activeScenarios || []).length > 0 &&
      (sim.activeScenarios || []).every((s: any) => updatedCompleted.includes(s.id));

    if (allScenariosDone && !dailyMissionsCompleted.includes('quest')) {
      const isOnTime = dailyDeadline > 0 && Date.now() < dailyDeadline;
      const questBonus = isOnTime ? 50 : Math.floor(50 * 0.3);
      dispatch(addXP(questBonus));
      dispatch(completeDailyMission('quest'));
    }
  };

  const playAudio = () => {
    AudioEngine.play(scenario.narrative, language);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top Header Match iOS Style */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="arrow-left" size={20} color={Colors.sakhi.goldLight} style={{ marginRight: 6 }} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={playAudio}>
          <Feather name="volume-2" size={24} color={Colors.sakhi.goldLight} />
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
            <Text style={[styles.choicePrompt, { color: theme.text }]}>{t('whatWillYouDo', lang)}</Text>
            {scenario.choices.map((choice: any) => (
              <AnimatedChoiceCard
                key={choice.id}
                choice={choice}
                lang={lang}
                theme={theme}
                onPress={() => handleChoice(choice)}
              />
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

function AnimatedChoiceCard({ choice, lang, theme, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const borderColor = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', bounciness: 14, speed: 16 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View
        style={[
          styles.choiceCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            transform: [{ scale }],
          },
        ]}
      >
        <TranslatedText text={choice.text} lang={lang} style={[styles.choiceText, { color: theme.text }]} />
        <View style={styles.choiceRight}>
          <Feather name="arrow-right" size={20} color={Colors.sakhi.goldLight} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    backgroundColor: '#218C53',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.sakhi.goldLight,
  },
  backBtnText: {
    color: Colors.sakhi.goldLight,
    fontSize: 16,
    fontWeight: '800',
  },
  audioIcon: {
    fontSize: 24,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: Colors.sakhi.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.sakhi.goldDark,
    marginBottom: 12,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.sakhi.goldDark + '30',
    marginBottom: 16,
  },
  narrative: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  choicePrompt: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  choiceCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderLeftWidth: 3,
    borderLeftColor: Colors.sakhi.goldLight,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  choiceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
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
    borderWidth: 2,
    borderColor: Colors.sakhi.green + '40',
  },
  completedEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '900',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  resultModal: {
    backgroundColor: Colors.sakhi.navy,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: Colors.sakhi.goldLight,
  },
  resultEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  resultFeedback: {
    fontSize: 16,
    color: '#B0BEC5',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  rewardsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16,
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark,
  },
  rewardItem: {
    alignItems: 'center',
    flex: 1,
  },
  rewardVal: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
  },
  rewardLbl: {
    fontSize: 12,
    color: '#8899AA',
    fontWeight: '700',
    marginTop: 4,
  },
  rewardDivider: {
    width: 2,
    height: 40,
    backgroundColor: Colors.sakhi.goldDark,
  },
  doneBtn: {
    backgroundColor: Colors.sakhi.goldLight,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.sakhi.goldDark,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A1A2E',
  },
});
