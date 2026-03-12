import { MONTHLY_INCOME } from '../constants/theme';

export interface JarState {
  savings: number;
  household: number;
  emergency: number;
  children: number;
}

export interface SimulationState {
  month: number;
  income: number;
  jars: JarState;
  finHealthScore: number;
  completedScenarios: string[];
  completedFraudCases: string[];
  totalChoicesMade: number;
  optimalChoices: number;
}

export function createInitialSimulation(): SimulationState {
  return {
    month: 1,
    income: MONTHLY_INCOME,
    jars: { savings: 0, household: 0, emergency: 0, children: 0 },
    finHealthScore: 50,
    completedScenarios: [],
    completedFraudCases: [],
    totalChoicesMade: 0,
    optimalChoices: 0,
  };
}

export function getFinHealthLevel(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

export function calculateJarTotal(jars: JarState): number {
  return jars.savings + jars.household + jars.emergency + jars.children;
}

export function advanceMonth(state: SimulationState): SimulationState {
  return {
    ...state,
    month: state.month + 1,
    income: MONTHLY_INCOME,
  };
}

export function applyJarAllocation(
  jars: JarState,
  jar: keyof JarState,
  amount: number
): JarState {
  return {
    ...jars,
    [jar]: jars[jar] + amount,
  };
}

export function clampFinHealth(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function isEndOfMonth(date: Date = new Date()): boolean {
  // Logic specifically requested by user for end of month detection based on calendar
  const d = date.getDate();
  const m = date.getMonth() + 1; // 1-12
  const y = date.getFullYear();

  const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  
  if (m === 2) {
    return (isLeap && d === 29) || (!isLeap && d === 28);
  }
  if ([4, 6, 9, 11].includes(m)) {
    return d === 30;
  }
  return d === 31;
}
