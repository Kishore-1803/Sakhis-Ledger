export interface BehaviorLog {
  timestamp: number;
  action: string;
  details: Record<string, any>;
}

class BehavioralLogger {
  private logs: BehaviorLog[] = [];

  log(action: string, details: Record<string, any> = {}) {
    this.logs.push({
      timestamp: Date.now(),
      action,
      details,
    });
  }

  getLogs(): BehaviorLog[] {
    return [...this.logs];
  }

  getActionCount(action: string): number {
    return this.logs.filter((l) => l.action === action).length;
  }

  getSuggestedDifficulty(): 'easy' | 'medium' | 'hard' {
    const optimalCount = this.getActionCount('optimal_choice');
    const totalChoices = this.getActionCount('choice_made');
    if (totalChoices === 0) return 'easy';
    const ratio = optimalCount / totalChoices;
    if (ratio >= 0.7) return 'hard';
    if (ratio >= 0.4) return 'medium';
    return 'easy';
  }

  clear() {
    this.logs = [];
  }
}

export const behavioralLogger = new BehavioralLogger();
