import { RootState } from '../store/store';
import { MonthlyReport, InsightItem, TipItem } from '../store/engagementSlice';

/**
 * Analytics engine for generating personalized monthly reports
 * Teaches metacognition about financial behavior
 */

export class InsightsEngine {
  /**
   * Calculate accuracy rate from mistakes
   * 0% = 10+ mistakes, 100% = 0 mistakes
   */
  static calculateAccuracyRate(mistakes: number): number {
    return Math.max(0, 100 - (mistakes * 5));
  }

  /**
   * Calculate savings consistency based on allocations
   * Checks if user allocates to all 4 jars regularly
   */
  static calculateSavingsConsistency(userState: any, simulationState: any): number {
    const jars = simulationState?.jars || {};
    const allocatedJars = Object.values(jars).filter((amount: any) => Number(amount) > 0).length;

    // Bonus for allocating to all 4 jars (100), partial credit otherwise
    return (allocatedJars / 4) * 100;
  }

  /**
   * Calculate decision quality from scenario performance
   * Optimal choices vs total choices
   */
  static calculateDecisionQuality(
    completedScenarios: number,
    correctAnswers: number
  ): number {
    if (completedScenarios === 0) return 50; // Default for new users
    return Math.min(100, (correctAnswers / completedScenarios) * 100);
  }

  /**
   * Calculate risk awareness from scam detection accuracy
   */
  static calculateRiskAwareness(
    completedFraudCases: number,
    fraudCaseErrors: number
  ): number {
    if (completedFraudCases === 0) return 50;
    return Math.max(0, 100 - (fraudCaseErrors * 10));
  }

  /**
   * Generate overall score from weighted metrics
   */
  static calculateOverallScore(
    accuracyRate: number,
    savingsConsistency: number,
    decisionQuality: number,
    riskAwareness: number
  ): number {
    // Weighted average: 30% accuracy, 25% savings, 25% decisions, 20% risk
    return Math.round(
      accuracyRate * 0.3 +
      savingsConsistency * 0.25 +
      decisionQuality * 0.25 +
      riskAwareness * 0.2
    );
  }

  /**
   * Identify strength areas from metrics
   */
  static identifyStrengths(
    accuracyRate: number,
    savingsConsistency: number,
    decisionQuality: number,
    riskAwareness: number
  ): InsightItem[] {
    const strengths: InsightItem[] = [];

    if (accuracyRate >= 80) {
      strengths.push({
        id: 'high_accuracy',
        message: 'You\'re becoming a financial expert!',
        icon: '🧠',
        category: 'strength',
      });
    }

    if (savingsConsistency >= 80) {
      strengths.push({
        id: 'consistent_saver',
        message: 'You\'re allocating to all 4 jars - excellent discipline!',
        icon: '💪',
        category: 'strength',
      });
    }

    if (decisionQuality >= 75) {
      strengths.push({
        id: 'smart_decisions',
        message: 'Your financial decisions show wisdom and foresight.',
        icon: '🎯',
        category: 'strength',
      });
    }

    if (riskAwareness >= 80) {
      strengths.push({
        id: 'scam_awareness',
        message: 'You\'re becoming a scam-detection expert!',
        icon: '🛡️',
        category: 'strength',
      });
    }

    return strengths.length > 0 ? strengths : [{
      id: 'progress_made',
      message: 'You\'re making progress on your financial journey!',
      icon: '📈',
      category: 'strength',
    }];
  }

  /**
   * Identify areas needing improvement
   */
  static identifyImprovements(
    accuracyRate: number,
    savingsConsistency: number,
    decisionQuality: number,
    riskAwareness: number
  ): InsightItem[] {
    const improvements: InsightItem[] = [];

    if (accuracyRate < 70) {
      improvements.push({
        id: 'improve_accuracy',
        message: 'Review scenarios you found difficult this month.',
        icon: '📚',
        category: 'improvement',
      });
    }

    if (savingsConsistency < 75) {
      improvements.push({
        id: 'balance_jars',
        message: 'Try allocating to all 4 jars for better financial health.',
        icon: '⚖️',
        category: 'improvement',
      });
    }

    if (decisionQuality < 70) {
      improvements.push({
        id: 'think_decisions',
        message: 'Pause before allocating - consider the long-term impact.',
        icon: '🤔',
        category: 'improvement',
      });
    }

    if (riskAwareness < 75) {
      improvements.push({
        id: 'scam_training',
        message: 'Spend more time in the Arena to spot scams faster.',
        icon: '🎓',
        category: 'improvement',
      });
    }

    return improvements;
  }

  /**
   * Generate personalized tips based on behavior
   */
  static generatePersonalizedTips(
    userLevel: number,
    streak: number,
    completedScenarios: number,
    totalJarAmount: number
  ): TipItem[] {
    const tips: TipItem[] = [];

    // Streak-based tips
    if (streak >= 7) {
      tips.push({
        id: 'streak_milestone',
        message: 'You\'re on a 7-day streak! Keep it going for special rewards.',
        actionable: 'Complete tomorrow\'s missions',
        icon: '🔥',
      });
    }

    // Level-based tips
    if (userLevel >= 5) {
      tips.push({
        id: 'advanced_content',
        message: 'You\'ve unlocked Advanced Scenario Packs!',
        actionable: 'Explore challenging real-world scenarios',
        icon: '🌟',
      });
    }

    // Savings milestone tips
    if (totalJarAmount >= 5000) {
      tips.push({
        id: 'savings_milestone',
        message: 'You\'ve saved ₹5000+! This is a major achievement.',
        actionable: 'Set a new savings goal',
        icon: '🎉',
      });
    }

    // Scenario completion tips
    if (completedScenarios >= 25) {
      tips.push({
        id: 'scenario_master',
        message: 'You\'ve completed 25+ scenarios. You\'re a master!',
        actionable: 'Help others through mentorship',
        icon: '👩‍🏫',
      });
    }

    // Default tip if no conditions met
    if (tips.length === 0) {
      tips.push({
        id: 'keep_going',
        message: 'Every rupee saved is a step toward your financial goals.',
        actionable: 'Allocate to savings this week',
        icon: '💚',
      });
    }

    return tips;
  }

  /**
   * Suggest next badges to unlock
   */
  static suggestNextBadges(unlockedBadges: string[]): string[] {
    const allBadges = [
      'first_quest',
      'scam_buster',
      'saver',
      'streak_3',
      'streak_7',
      'level_5',
      'daily_hero',
    ];

    const locked = allBadges.filter(b => !unlockedBadges.includes(b));
    return locked.slice(0, 3); // Suggest up to 3
  }

  /**
   * Generate complete monthly report
   */
  static generateMonthlyReport(
    userState: any,
    simulationState: any
  ): MonthlyReport {
    const completedScenarios = simulationState?.completedScenarios?.length || 0;
    const completedFraudCases = simulationState?.completedFraudCases?.length || 0;
    const mistakes = userState?.mistakes || 0;
    const totalJars =
      Object.values(simulationState?.jars || {}).reduce((a: any, b: any) => (a + Number(b)) || 0, 0);

    // Calculate all metrics
    const accuracyRate = this.calculateAccuracyRate(mistakes);
    const savingsConsistency = this.calculateSavingsConsistency(userState, simulationState);
    const decisionQuality = this.calculateDecisionQuality(completedScenarios, completedScenarios - mistakes);
    const riskAwareness = this.calculateRiskAwareness(completedFraudCases, 0); // Simplified

    const overallScore = this.calculateOverallScore(
      accuracyRate,
      savingsConsistency,
      decisionQuality,
      riskAwareness
    );

    const strengths = this.identifyStrengths(
      accuracyRate,
      savingsConsistency,
      decisionQuality,
      riskAwareness
    );

    const improvements = this.identifyImprovements(
      accuracyRate,
      savingsConsistency,
      decisionQuality,
      riskAwareness
    );

    const personalizedTips = this.generatePersonalizedTips(
      userState?.level || 1,
      userState?.streak || 0,
      completedScenarios,
      totalJars
    );

    const nextBadgeSuggestions = this.suggestNextBadges(userState?.unlockedBadges || []);

    return {
      date: new Date().toISOString().split('T')[0],
      overallScore,
      accuracyRate: Math.round(accuracyRate),
      savingsConsistency: Math.round(savingsConsistency),
      decisionQuality: Math.round(decisionQuality),
      riskAwareness: Math.round(riskAwareness),
      strengths,
      improvements,
      personalizedTips,
      nextBadgeSuggestions,
    };
  }
}
