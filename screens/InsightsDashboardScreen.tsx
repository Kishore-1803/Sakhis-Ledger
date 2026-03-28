import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../utils/useTheme';
import TranslatedText from '../components/TranslatedText';
import InsightCard from '../components/InsightCard';
import Feather from '@expo/vector-icons/Feather';

const { width } = Dimensions.get('window');

interface InsightsDashboardScreenProps {
  navigation: any;
}

export default function InsightsDashboardScreen({
  navigation,
}: InsightsDashboardScreenProps) {
  const theme = useTheme();
  const insights = useSelector((state: RootState) => state.engagement?.insights);
  const user = useSelector((state: RootState) => state.user);

  // Get the most recent report
  const latestReport = insights?.monthlyReports?.[insights.monthlyReports.length - 1];

  const renderMetricCard = (
    label: string,
    value: number,
    color: string,
    icon: string
  ) => (
    <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
      <View style={styles.metricTop}>
        <Text style={styles.metricIcon}>{icon}</Text>
        <Text style={[styles.metricLabel, { color: theme.textSub }]}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}%</Text>
      <View style={[styles.metricBar, { backgroundColor: color + '20' }]}>
        <View
          style={[
            styles.metricBarFill,
            {
              width: `${value}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );

  if (!latestReport) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Reports Yet
          </Text>
          <Text style={[styles.emptyMessage, { color: theme.textSub }]}>
            Complete a full month of activities to see your insights!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Monthly Insights
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Overall Score */}
        <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
          <Text style={styles.scoreIcon}>⭐</Text>
          <Text style={[styles.scoreLabel, { color: theme.textSub }]}>
            Overall Score
          </Text>
          <Text style={[styles.scoreValue, { color: '#FFD700' }]}>
            {latestReport.overallScore}/100
          </Text>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${latestReport.overallScore}%`,
                  backgroundColor: '#FFD700',
                },
              ]}
            />
          </View>
          <Text style={[styles.scoreMessage, { color: theme.textSub }]}>
            {latestReport.overallScore >= 80
              ? '🌟 Excellent progress! You\'re mastering financial literacy.'
              : latestReport.overallScore >= 60
              ? '🚀 Good work! Keep practicing to reach excellence.'
              : '💪 You\'re learning! Every step counts toward mastery.'}
          </Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {renderMetricCard(
            'Accuracy',
            latestReport.accuracyRate,
            '#2ECC71',
            '🎯'
          )}
          {renderMetricCard(
            'Savings',
            latestReport.savingsConsistency,
            '#3498DB',
            '💰'
          )}
          {renderMetricCard(
            'Decisions',
            latestReport.decisionQuality,
            '#E74C3C',
            '🤔'
          )}
          {renderMetricCard(
            'Risk Awareness',
            latestReport.riskAwareness,
            '#9B59B6',
            '🛡️'
          )}
        </View>

        {/* Report Date */}
        <View style={styles.dateContainer}>
          <Feather name="calendar" size={14} color={theme.textSub} />
          <Text style={[styles.dateText, { color: theme.textSub }]}>
            Report for {new Date(latestReport.date).toLocaleDateString('en-IN')}
          </Text>
        </View>

        {/* Strengths Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✅</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Strengths
            </Text>
          </View>
          {latestReport.strengths.map((strength) => (
            <InsightCard
              key={strength.id}
              id={strength.id}
              icon={strength.icon}
              message={strength.message}
              isStrength={true}
            />
          ))}
        </View>

        {/* Improvements Section */}
        {latestReport.improvements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🌱</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Growth Opportunities
              </Text>
            </View>
            {latestReport.improvements.map((improvement) => (
              <InsightCard
                key={improvement.id}
                id={improvement.id}
                icon={improvement.icon}
                message={improvement.message}
                isStrength={false}
              />
            ))}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💡</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Personalized Tips
            </Text>
          </View>
          {latestReport.personalizedTips.map((tip) => (
            <InsightCard
              key={tip.id}
              id={tip.id}
              icon={tip.icon}
              message={tip.message}
              actionable={tip.actionable}
              isStrength={true}
            />
          ))}
        </View>

        {/* Next Badges Section */}
        {latestReport.nextBadgeSuggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🏆</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Badges to Unlock
              </Text>
            </View>
            <View style={[styles.badgesContainer, { backgroundColor: theme.card }]}>
              {latestReport.nextBadgeSuggestions.map((badgeId) => (
                <View key={badgeId} style={styles.badgeChip}>
                  <Text style={styles.badgeChipText}>{badgeId}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.badgesHint, { color: theme.textSub }]}>
              Keep practicing to earn these special achievements!
            </Text>
          </View>
        )}

        {/* Call to Action */}
        <View style={[styles.ctaCard, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
          <Text style={styles.ctaIcon}>🌟</Text>
          <Text style={[styles.ctaTitle, { color: theme.text }]}>
            Keep Growing!
          </Text>
          <Text style={[styles.ctaMessage, { color: theme.textSub }]}>
            Next month's report will show your progress. Stay consistent with daily missions and jar allocations.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.ctaButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scoreCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 12,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreMessage: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  metricBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  badgesContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    backgroundColor: '#FFD70030',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  badgeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  badgesHint: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  ctaCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  ctaIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  ctaMessage: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
