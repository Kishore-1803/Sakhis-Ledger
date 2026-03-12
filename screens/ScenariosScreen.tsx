import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ScenarioCard from '../components/ScenarioCard';
import GlobalHeader from '../components/GlobalHeader';
import { Colors } from '../constants/theme';
import { t, LanguageCode } from '../utils/i18n';
import { TranslatedText } from '../components/TranslatedText';
import { useDynamicTranslation } from '../utils/translate';

interface ScenariosScreenProps {
  navigation: any;
}

function TranslatedScenarioCard({ scenario, sim, navigation, lang }: any) {
  const title = useDynamicTranslation(scenario.title, lang);
  const maxReward = scenario.choices.reduce((max: number, choice: any) => {
    return Math.max(max, choice.impact.xpReward || 0);
  }, 0);

  return (
    <ScenarioCard
      title={title}
      category={scenario.category}
      completed={sim.completedScenarios.includes(scenario.id)}
      xpReward={maxReward || 100}
      onPress={() => navigation.navigate('ScenarioDetail', { scenarioId: scenario.id })}
    />
  );
}

export default function ScenariosScreen({ navigation }: ScenariosScreenProps) {
  const sim = useSelector((state: RootState) => state.simulation);
  const user = useSelector((state: RootState) => state.user);
  const lang = user.language as LanguageCode;

  // Rule-based engine: Load dynamically generated content based on level
  const availableScenarios = React.useMemo(() => {
    return (sim.activeScenarios || []).filter((scenario: any) => {
      // Don't show completed ones
      if (sim.completedScenarios.includes(scenario.id)) return false;

      // Determine implicit difficulty by maximum XP reward provided in the scenario.
      const maxReward = scenario.choices.reduce((max: number, choice: any) => {
        return Math.max(max, choice.impact.xpReward || 0);
      }, 0);

      // If max reward > 120, it's a "hard" scenario. Lock until player proves readiness (level 3+ or high finHealth).
      if (maxReward > 120) {
        if (user.level < 3 && sim.finHealthScore < 70) {
          return false; // Hide this scenario to reduce difficulty for new struggling users
        }
      }
      return true;
    }).slice(0, 5); // Show max 5 scenarios at a time
  }, [sim.completedScenarios, user.level, sim.finHealthScore, sim.activeScenarios]);

  return (
    <SafeAreaView style={styles.container}>
      <GlobalHeader title={t('quests', lang)} audioText={t('quests', lang) + '. Complete these scenarios to earn XP.'} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Display */}
        <View style={styles.progressBox}>
          <TranslatedText style={styles.progressLabel}>dailyProgress</TranslatedText>
          <Text style={styles.progressText}>
            {sim.completedScenarios.length} Total
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `100%` }, // Abstract progress
              ]}
            />
          </View>
        </View>

        <TranslatedText style={styles.sectionTitle}>availableMissions</TranslatedText>

        {/* Quest list */}
        {availableScenarios.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20, marginTop: 40 }}>
            <TranslatedText style={{ textAlign: 'center', color: Colors.neutral.darkGray }} lang={lang}>
              Great job! You have completed all available missions for now. Level up or wait for the next month to unlock more.
            </TranslatedText>
          </View>
        ) : (
          availableScenarios.map((scenario: any) => (
            <TranslatedScenarioCard
              key={scenario.id}
              scenario={scenario}
              sim={sim}
              navigation={navigation}
              lang={lang}
            />
          ))
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
  progressBox: {
    backgroundColor: Colors.sakhi.green,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  progressLabel: {
    color: Colors.neutral.white,
    fontWeight: '600',
    fontSize: 14,
    opacity: 0.9,
  },
  progressText: {
    fontSize: 24,
    color: Colors.sakhi.gold,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sakhi.gold,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 16,
  },
});
