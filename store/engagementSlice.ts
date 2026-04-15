import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Constants ────────────────────────────────────────────────────────────

export const TREE_TIERS = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JarHealthState {
  health: number; // 0-100
  lastDecayDate: string; // ISO date
  cracksLevel: number; // 0-3 (visual states)
  rescueCount: number; // Times user rescued this jar
  lastAllocationDate: string; // ISO date
}

export interface FortuneTreeState {
  treeTier: number; // 1-10
  growthPoints: number;
  branches: string[]; // Unlocked branch IDs
  lastWatered: string; // ISO date
  milestonesReached: number[];
}

export interface MonthlyReport {
  date: string; // ISO date
  overallScore: number; // 0-100
  accuracyRate: number; // 0-100
  savingsConsistency: number; // 0-100
  decisionQuality: number; // 0-100
  riskAwareness: number; // 0-100
  strengths: InsightItem[];
  improvements: InsightItem[];
  personalizedTips: TipItem[];
  nextBadgeSuggestions: string[];
}

export interface InsightItem {
  id: string;
  message: string;
  icon: string;
  category: 'strength' | 'improvement';
}

export interface TipItem {
  id: string;
  message: string;
  actionable: string;
  icon: string;
}

export interface InsightsState {
  monthlyReports: MonthlyReport[];
  lastReportDate: string; // ISO date
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface StoryProgress {
  currentStoryId: string | null;
  currentChapter: number;
  completedChapters: string[]; // chapterIds
  choices: Record<string, string>; // chapterId -> choiceId
  endings: {
    good: number;
    bad: number;
    neutral: number;
  };
  completedStories: string[]; // storyIds
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  duration: number; // hours
  challenges: EventChallenge[];
}

export interface EventChallenge {
  id: string;
  description: string;
  requirement: {
    type: 'complete_scenarios' | 'defeat_scams' | 'save_amount' | 'allocate_jars';
    target: number;
  };
  reward: {
    xp: number;
    specialItem?: string;
    badge?: string;
  };
  progress: number; // Current progress toward target
}

export interface MarketEventsState {
  activeEvent: MarketEvent | null;
  lastEventDate: string; // ISO date
  eventCompletedChallenges: string[]; // challengeIds
  specialBadgesUnlocked: string[];
  eventsParticipated: number;
}

export interface WisdomTokensState {
  tokensEarned: number;
  tokensSpent: number;
  mentorLevel: number; // 0-3 (Helper, Guide, Elder)
  helpedCount: number; // Times helped others
  correctAdviceCount: number;
  mentoringHistory: MentoringActivity[];
}

export interface MentoringActivity {
  date: string; // ISO date
  scenarioId: string;
  adviceQuality: 'excellent' | 'good' | 'poor';
  tokensEarned: number;
}

// ─── Initial State ──────────────────────────────────────────────────────────

interface EngagementState {
  // Jar Rescue System
  jarHealth: {
    household: JarHealthState;
    children: JarHealthState;
    savings: JarHealthState;
    emergency: JarHealthState;
  };

  // Fortune Tree
  fortuneTree: FortuneTreeState;

  // Reflective Insights
  insights: InsightsState;

  // Sakhi Stories
  stories: StoryProgress;

  // Market Events
  marketEvents: MarketEventsState;

  // Wisdom Tokens
  wisdomTokens: WisdomTokensState;

  // Advanced Modules
  unlockedScenarioPacks: string[];
}

const createInitialJarHealth = (): JarHealthState => ({
  health: 100,
  lastDecayDate: '',
  cracksLevel: 0,
  rescueCount: 0,
  lastAllocationDate: ''
});

const initialState: EngagementState = {
  jarHealth: {
    household: createInitialJarHealth(),
    children: createInitialJarHealth(),
    savings: createInitialJarHealth(),
    emergency: createInitialJarHealth(),
  },

  fortuneTree: {
    treeTier: 1,
    growthPoints: 0,
    branches: [],
    lastWatered: '',
    milestonesReached: [],
  },

  insights: {
    monthlyReports: [],
    lastReportDate: '',
    strengthAreas: [],
    improvementAreas: [],
  },

  stories: {
    currentStoryId: null,
    currentChapter: 0,
    completedChapters: [],
    choices: {},
    endings: {
      good: 0,
      bad: 0,
      neutral: 0,
    },
    completedStories: [],
  },

  marketEvents: {
    activeEvent: null,
    lastEventDate: '',
    eventCompletedChallenges: [],
    specialBadgesUnlocked: [],
    eventsParticipated: 0,
  },

  wisdomTokens: {
    tokensEarned: 0,
    tokensSpent: 0,
    mentorLevel: 0,
    helpedCount: 0,
    correctAdviceCount: 0,
    mentoringHistory: [],
  },

  unlockedScenarioPacks: [],
};

// ─── Slice ──────────────────────────────────────────────────────────────────

const engagementSlice = createSlice({
  name: 'engagement',
  initialState,
  reducers: {
    // ── Jar Rescue System ────────────────────────────────────────────────────

    /**
     * Daily decay check - reduces jar health by 5 points per day of inactivity
     */
    decayJarHealth(state) {
      const today = new Date().toISOString().split('T')[0];

      (Object.keys(state.jarHealth) as Array<keyof typeof state.jarHealth>).forEach(jarKey => {
        const jar = state.jarHealth[jarKey];

        if (jar.lastDecayDate !== today) {
          // Calculate days since last allocation (not just decay check)
          const lastActivity = jar.lastAllocationDate || jar.lastDecayDate;
          if (lastActivity) {
            const lastDate = new Date(lastActivity);
            const currentDate = new Date(today);
            const daysSinceActivity = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSinceActivity > 0) {
              // Decay 5 points per day
              jar.health = Math.max(0, jar.health - (5 * daysSinceActivity));
            }
          }

          jar.lastDecayDate = today;

          // Update cracks level based on health
          jar.cracksLevel = jar.health > 75 ? 0 : jar.health > 50 ? 1 : jar.health > 25 ? 2 : 3;
        }
      });
    },

    /**
     * Heal jar health when user allocates money
     */
    healJar(state, action: PayloadAction<{ jar: 'household' | 'children' | 'savings' | 'emergency', amount: number }>) {
      const { jar, amount } = action.payload;
      const jarHealth = state.jarHealth[jar];

      // Heal proportional to amount (₹100 = +2 health, capped at 100)
      const healAmount = Math.min(20, Math.floor(amount / 50));
      jarHealth.health = Math.min(100, jarHealth.health + healAmount);
      jarHealth.lastAllocationDate = new Date().toISOString().split('T')[0];

      // Update cracks level
      jarHealth.cracksLevel = jarHealth.health > 75 ? 0 : jarHealth.health > 50 ? 1 : jarHealth.health > 25 ? 2 : 3;
    },

    /**
     * Rescue jar - restore to full health
     */
    rescueJar(state, action: PayloadAction<'household' | 'children' | 'savings' | 'emergency'>) {
      const jar = state.jarHealth[action.payload];
      jar.health = 100;
      jar.cracksLevel = 0;
      jar.rescueCount += 1;
      jar.lastAllocationDate = new Date().toISOString().split('T')[0];
    },

    // ── Fortune Tree ─────────────────────────────────────────────────────────

    /**
     * Water tree - add growth points
     */
    waterTree(state, action: PayloadAction<number>) {
      const points = action.payload;
      state.fortuneTree.growthPoints += points;
      state.fortuneTree.lastWatered = new Date().toISOString().split('T')[0];

      // Check for tier upgrades
      const currentPoints = state.fortuneTree.growthPoints;
      let newTier = 1;

      for (let i = TREE_TIERS.length - 1; i >= 0; i--) {
        if (currentPoints >= TREE_TIERS[i]) {
          newTier = i + 1;
          break;
        }
      }

      // If tier increased, unlock new branch
      if (newTier > state.fortuneTree.treeTier) {
        const oldTier = state.fortuneTree.treeTier;
        state.fortuneTree.treeTier = newTier;

        // Unlock branches at specific tiers
        if (newTier === 3 && !state.fortuneTree.branches.includes('emergency')) {
          state.fortuneTree.branches.push('emergency');
        }
        if (newTier === 5 && !state.fortuneTree.branches.includes('education')) {
          state.fortuneTree.branches.push('education');
        }
        if (newTier === 7 && !state.fortuneTree.branches.includes('business')) {
          state.fortuneTree.branches.push('business');
        }
        if (newTier === 10 && !state.fortuneTree.branches.includes('prosperity')) {
          state.fortuneTree.branches.push('prosperity');
        }

        // Track milestone
        if (!state.fortuneTree.milestonesReached.includes(newTier)) {
          state.fortuneTree.milestonesReached.push(newTier);
        }
      }
    },

    // ── Reflective Insights ──────────────────────────────────────────────────

    /**
     * Add monthly report
     */
    addMonthlyReport(state, action: PayloadAction<MonthlyReport>) {
      state.insights.monthlyReports.push(action.payload);
      state.insights.lastReportDate = action.payload.date;

      // Update strength and improvement areas
      state.insights.strengthAreas = action.payload.strengths.map(s => s.id);
      state.insights.improvementAreas = action.payload.improvements.map(i => i.id);

      // Keep only last 6 months of reports
      if (state.insights.monthlyReports.length > 6) {
        state.insights.monthlyReports = state.insights.monthlyReports.slice(-6);
      }
    },

    // ── Sakhi Stories ────────────────────────────────────────────────────────

    /**
     * Start a new story
     */
    startStory(state, action: PayloadAction<string>) {
      state.stories.currentStoryId = action.payload;
      state.stories.currentChapter = 1;
    },

    /**
     * Make story choice
     */
    makeStoryChoice(state, action: PayloadAction<{ chapterId: string, choiceId: string }>) {
      const { chapterId, choiceId } = action.payload;
      state.stories.choices[chapterId] = choiceId;
      state.stories.completedChapters.push(chapterId);
    },

    /**
     * Advance to next chapter
     */
    advanceChapter(state, action: PayloadAction<number>) {
      state.stories.currentChapter = action.payload;
    },

    /**
     * Complete story with ending type
     */
    completeStory(state, action: PayloadAction<{ storyId: string, endingType: 'good' | 'bad' | 'neutral' }>) {
      const { storyId, endingType } = action.payload;

      if (!state.stories.completedStories.includes(storyId)) {
        state.stories.completedStories.push(storyId);
      }

      state.stories.endings[endingType] += 1;
      state.stories.currentStoryId = null;
      state.stories.currentChapter = 0;
    },

    /**
     * Reset story progress (for replay)
     */
    resetStoryProgress(state, action: PayloadAction<string>) {
      // Remove story-specific choices
      const storyId = action.payload;
      Object.keys(state.stories.choices).forEach(chapterId => {
        if (chapterId.startsWith(storyId)) {
          delete state.stories.choices[chapterId];
        }
      });

      state.stories.completedChapters = state.stories.completedChapters.filter(
        ch => !ch.startsWith(storyId)
      );
    },

    // ── Market Events ────────────────────────────────────────────────────────

    /**
     * Activate market event
     */
    activateMarketEvent(state, action: PayloadAction<MarketEvent>) {
      state.marketEvents.activeEvent = action.payload;
      state.marketEvents.lastEventDate = new Date().toISOString().split('T')[0];
      state.marketEvents.eventsParticipated += 1;
    },

    /**
     * Update event challenge progress
     */
    updateEventProgress(state, action: PayloadAction<{ challengeId: string, progress: number }>) {
      const { challengeId, progress } = action.payload;

      if (state.marketEvents.activeEvent) {
        const challenge = state.marketEvents.activeEvent.challenges.find(c => c.id === challengeId);
        if (challenge) {
          challenge.progress = Math.min(challenge.requirement.target, challenge.progress + progress);
        }
      }
    },

    /**
     * Complete event challenge
     */
    completeEventChallenge(state, action: PayloadAction<string>) {
      const challengeId = action.payload;

      if (!state.marketEvents.eventCompletedChallenges.includes(challengeId)) {
        state.marketEvents.eventCompletedChallenges.push(challengeId);
      }
    },

    /**
     * Unlock special badge from event
     */
    unlockEventBadge(state, action: PayloadAction<string>) {
      const badgeId = action.payload;

      if (!state.marketEvents.specialBadgesUnlocked.includes(badgeId)) {
        state.marketEvents.specialBadgesUnlocked.push(badgeId);
      }
    },

    /**
     * End market event
     */
    endMarketEvent(state) {
      state.marketEvents.activeEvent = null;
      state.marketEvents.eventCompletedChallenges = [];
    },

    // ── Wisdom Tokens ────────────────────────────────────────────────────────

    /**
     * Earn wisdom tokens
     */
    earnWisdomToken(state, action: PayloadAction<{ tokens: number, scenarioId: string, quality: 'excellent' | 'good' | 'poor' }>) {
      const { tokens, scenarioId, quality } = action.payload;

      state.wisdomTokens.tokensEarned += tokens;
      state.wisdomTokens.helpedCount += 1;

      if (quality === 'excellent' || quality === 'good') {
        state.wisdomTokens.correctAdviceCount += 1;
      }

      // Add to history
      state.wisdomTokens.mentoringHistory.push({
        date: new Date().toISOString().split('T')[0],
        scenarioId,
        adviceQuality: quality,
        tokensEarned: tokens,
      });

      // Keep only last 50 activities
      if (state.wisdomTokens.mentoringHistory.length > 50) {
        state.wisdomTokens.mentoringHistory = state.wisdomTokens.mentoringHistory.slice(-50);
      }

      // Update mentor level based on tokens earned
      const totalTokens = state.wisdomTokens.tokensEarned - state.wisdomTokens.tokensSpent;
      if (totalTokens >= 201) {
        state.wisdomTokens.mentorLevel = 3; // Elder
      } else if (totalTokens >= 51) {
        state.wisdomTokens.mentorLevel = 2; // Guide
      } else if (totalTokens >= 1) {
        state.wisdomTokens.mentorLevel = 1; // Helper
      } else {
        state.wisdomTokens.mentorLevel = 0;
      }
    },

    /**
     * Spend wisdom tokens
     */
    spendWisdomToken(state, action: PayloadAction<number>) {
      const cost = action.payload;
      const available = state.wisdomTokens.tokensEarned - state.wisdomTokens.tokensSpent;

      if (available >= cost) {
        state.wisdomTokens.tokensSpent += cost;

        // Update mentor level
        const totalTokens = state.wisdomTokens.tokensEarned - state.wisdomTokens.tokensSpent;
        if (totalTokens >= 201) {
          state.wisdomTokens.mentorLevel = 3;
        } else if (totalTokens >= 51) {
          state.wisdomTokens.mentorLevel = 2;
        } else if (totalTokens >= 1) {
          state.wisdomTokens.mentorLevel = 1;
        } else {
          state.wisdomTokens.mentorLevel = 0;
        }
      }
    },

    // ── Advanced Scenario Packs ──────────────────────────────────────────────

    /**
     * Unlock scenario pack
     */
    unlockScenarioPack(state, action: PayloadAction<string>) {
      const packId = action.payload;

      if (!state.unlockedScenarioPacks.includes(packId)) {
        state.unlockedScenarioPacks.push(packId);
      }
    },

    // ── Reset ────────────────────────────────────────────────────────────────

    resetEngagement() {
      return initialState;
    },
    /** Directly replace engagement state (used by switchUserProfile pre-load). */
    hydrateEngagement(_state, action: PayloadAction<Partial<EngagementState>>) {
      return { ...initialState, ...action.payload };
    },
  },
});

export const {
  decayJarHealth, healJar, rescueJar,
  waterTree,
  addMonthlyReport,
  startStory, makeStoryChoice, advanceChapter, completeStory, resetStoryProgress,
  activateMarketEvent, updateEventProgress, completeEventChallenge, unlockEventBadge, endMarketEvent,
  earnWisdomToken, spendWisdomToken,
  unlockScenarioPack,
  resetEngagement,
  hydrateEngagement,
} = engagementSlice.actions;

export default engagementSlice.reducer;
