import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { JarState } from '../engine/simulationEngine';
import { MONTHLY_INCOME } from '../constants/theme';

// Snapshot of task-progress fields that are saved per-guide on guide switch.
// Financial state (jars, balance, finHealthScore) and the Fortune Tree are
// intentionally NOT stored here — they are shared across both guides.
interface GuideTaskState {
  completedScenarios: string[];
  completedFraudCases: string[];
  currentScenarioId: string | null;
  totalChoicesMade: number;
  optimalChoices: number;
}

interface SimulationSliceState {
  month: number;
  income: number;
  balance: number;
  jars: JarState;
  finHealthScore: number;
  completedScenarios: string[];
  completedFraudCases: string[];
  totalChoicesMade: number;
  optimalChoices: number;
  currentScenarioId: string | null;
  lifeEventActive: boolean;
  lastLifeEvent: string | null;

  // Phase 2 Time & Progression
  lastActiveDate: number;
  lastMonthReportShown: number;

  // Game Content
  activeScams: any[];
  activeScenarios: any[];

  // Last life-event financial breakdown (for modal display)
  lastEventJarDeducted: number;
  lastEventBalanceDeducted: number;

  // Per-guide task snapshots — saved when the player switches guides so each
  // guide remembers its own quest / scam completion history independently.
  guideStates: {
    savitri: GuideTaskState | null;
    shanti:  GuideTaskState | null;
  };
}

const initialState: SimulationSliceState = {
  month: 1,
  income: MONTHLY_INCOME,
  balance: MONTHLY_INCOME,
  jars: { household: 0, children: 0, savings: 0, emergency: 0 },
  finHealthScore: 50,
  completedScenarios: [],
  completedFraudCases: [],
  totalChoicesMade: 0,
  optimalChoices: 0,
  currentScenarioId: null,
  lifeEventActive: false,
  lastLifeEvent: null,
  lastActiveDate: Date.now(),
  lastMonthReportShown: 0,
  activeScams: [],
  activeScenarios: [],
  lastEventJarDeducted: 0,
  lastEventBalanceDeducted: 0,
  guideStates: {
    savitri: null,
    shanti:  null,
  },
};

const simulationSlice = createSlice({
  name: 'simulation',
  initialState,
  reducers: {
    allocateToJar(state, action: PayloadAction<{ jar: keyof JarState; amount: number }>) {
      const { jar, amount } = action.payload;
      if (amount > 0 && amount <= state.balance) {
        state.jars[jar] += amount;
        state.balance -= amount;
      }
    },
    removeFromJar(state, action: PayloadAction<{ jar: keyof JarState; amount: number }>) {
      const { jar, amount } = action.payload;
      if (amount > 0 && amount <= state.jars[jar]) {
        state.jars[jar] -= amount;
        state.balance += amount;
      }
    },
    applyLifeEvent(state, action: PayloadAction<{ jar: keyof JarState; amount: number; eventId: string }>) {
      const { jar, amount, eventId } = action.payload;

      if (amount < 0) {
        // Negative = expense. Drain the jar first, spill remainder from balance.
        const needed = Math.abs(amount);
        const fromJar = Math.min(needed, state.jars[jar]);     // take what the jar has
        const fromBalance = needed - fromJar;                   // balance pays the rest

        state.jars[jar] = Math.max(0, state.jars[jar] - fromJar);
        state.balance   = Math.max(0, state.balance - fromBalance);

        // Store breakdown for modal display
        state.lastEventJarDeducted     = fromJar;
        state.lastEventBalanceDeducted = fromBalance;
      } else {
        // Positive = windfall (subsidy, bonus). Add directly to jar.
        state.jars[jar] += amount;
        state.lastEventJarDeducted     = 0;
        state.lastEventBalanceDeducted = 0;
      }

      state.lifeEventActive = true;
      state.lastLifeEvent   = eventId;
    },
    dismissLifeEvent(state) {
      state.lifeEventActive = false;
    },
    completeScenario(state, action: PayloadAction<{ scenarioId: string; isOptimal: boolean; finHealthDelta: number }>) {
      const { scenarioId, isOptimal, finHealthDelta } = action.payload;
      if (!state.completedScenarios.includes(scenarioId)) {
        state.completedScenarios.push(scenarioId);
      }
      state.totalChoicesMade += 1;
      if (isOptimal) state.optimalChoices += 1;
      state.finHealthScore = Math.max(0, Math.min(100, state.finHealthScore + finHealthDelta));
    },
    completeFraudCase(state, action: PayloadAction<string>) {
      if (!state.completedFraudCases.includes(action.payload)) {
        state.completedFraudCases.push(action.payload);
      }
    },
    setCurrentScenario(state, action: PayloadAction<string | null>) {
      state.currentScenarioId = action.payload;
    },
    setActiveContent(state, action: PayloadAction<{ scams: any[]; scenarios: any[] }>) {
      state.activeScams = action.payload.scams;
      state.activeScenarios = action.payload.scenarios;
    },
    advanceMonth(state) {
      state.month += 1;
      state.income = MONTHLY_INCOME;
      state.balance += MONTHLY_INCOME;
      state.lifeEventActive = false;
      state.lastLifeEvent = null;
    },
    setLastActiveDate(state, action: PayloadAction<number>) {
      state.lastActiveDate = action.payload;
    },
    markMonthReportShown(state, action: PayloadAction<number>) {
      state.lastMonthReportShown = action.payload;
    },
    /**
     * Switch the active guide (Savitri ↔ Shanti).
     *
     * What CHANGES per guide:  completedScenarios, completedFraudCases,
     *   currentScenarioId, totalChoicesMade, optimalChoices.
     *   activeScams / activeScenarios are cleared so App.tsx regenerates
     *   fresh content for the incoming guide.
     *
     * What stays SHARED:  jars, balance, finHealthScore, Fortune Tree (in
     *   engagementSlice), XP/level/streak/trophies (in userSlice).
     */
    switchGuide(state, action: PayloadAction<{ from: 'savitri' | 'shanti'; to: 'savitri' | 'shanti' }>) {
      const { from, to } = action.payload;
      if (from === to) return;

      // ── Save departing guide's task state ──────────────────────────────────
      state.guideStates[from] = {
        completedScenarios: [...state.completedScenarios],
        completedFraudCases: [...state.completedFraudCases],
        currentScenarioId:   state.currentScenarioId,
        totalChoicesMade:    state.totalChoicesMade,
        optimalChoices:      state.optimalChoices,
      };

      // ── Restore incoming guide's task state (or fresh initial) ─────────────
      const saved = state.guideStates[to];
      if (saved) {
        state.completedScenarios = saved.completedScenarios;
        state.completedFraudCases = saved.completedFraudCases;
        state.currentScenarioId  = saved.currentScenarioId;
        state.totalChoicesMade   = saved.totalChoicesMade;
        state.optimalChoices     = saved.optimalChoices;
      } else {
        // First time using this guide — clean task slate
        state.completedScenarios = [];
        state.completedFraudCases = [];
        state.currentScenarioId  = null;
        state.totalChoicesMade   = 0;
        state.optimalChoices     = 0;
      }

      // ── Always clear active content ────────────────────────────────────────
      // App.tsx detects activeScams.length === 0 and generates a fresh batch
      // of quests/scams tailored to the current level for this guide.
      state.activeScams     = [];
      state.activeScenarios = [];
    },
    resetSimulation() {
      return initialState;
    },
    /** Directly replace simulation state (used by switchUserProfile pre-load). */
    hydrateSimulation(_state, action: PayloadAction<Partial<SimulationSliceState>>) {
      return { ...initialState, ...action.payload };
    },
  },
});

export const {
  allocateToJar,
  removeFromJar,
  applyLifeEvent,
  dismissLifeEvent,
  completeScenario,
  completeFraudCase,
  setCurrentScenario,
  setActiveContent,
  advanceMonth,
  setLastActiveDate,
  markMonthReportShown,
  switchGuide,
  resetSimulation,
  hydrateSimulation,
} = simulationSlice.actions;
export default simulationSlice.reducer;
