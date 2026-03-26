export type ConceptType = 'UPI_SCAM' | 'BUDGETING' | 'KYC_CALL' | 'LOAN_FRAUD' | 'LOTTERY_SCAM' | 'GOV_SCAM' | 'UNKNOWN';

export interface MistakeRecord {
  frequency: number;
  severity: number;
  lastSeen: string;
}

export class AntigravityEngine {
  
  /**
   * Processes the result of a scenario/scam and returns the dynamic reward and updated mistakes.
   */
  static processScenarioResult(
    concept: ConceptType, 
    retries: number, 
    timeSec: number, 
    mistakeHistory: Record<string, MistakeRecord>
  ) {
    const isWeakArea = (mistakeHistory[concept]?.frequency || 0) > 1;
    
    // 1. Calculate Reward
    const jarsEarned = this.calculateJars(100, retries, timeSec, isWeakArea);
    
    // 2. Process Decay or Penalty
    const updatedMistakes: Record<string, MistakeRecord> = { ...mistakeHistory };
    if (!updatedMistakes[concept]) {
        updatedMistakes[concept] = { frequency: 0, severity: 1, lastSeen: new Date().toISOString() };
    }
    
    if (retries === 0) {
      // Decay mistake: correct on first try
      updatedMistakes[concept].frequency = Math.max(0, updatedMistakes[concept].frequency - 1);
      if (updatedMistakes[concept].frequency === 0) {
        updatedMistakes[concept].severity = 1.0;
      }
    } else {
      // Increase mistake penalty
      updatedMistakes[concept].frequency += 1;
      updatedMistakes[concept].severity = Math.min(3, updatedMistakes[concept].severity + 0.2);
    }
    
    updatedMistakes[concept].lastSeen = new Date().toISOString();
    
    return { jarsEarned, updatedMistakes };
  }

  /**
   * Calculates dynamic jar reward using the Antigravity formula.
   */
  private static calculateJars(base: number, retries: number, timeSec: number, wasWeakArea: boolean) {
    let accuracyMult = retries === 0 ? 1.2 : retries === 1 ? 0.8 : 0.4;
    // Speed multiplier logic. Give grace time for TTS to read.
    let speedMult = timeSec < 15 ? 1.2 : timeSec <= 45 ? 1.0 : 0.8;
    
    let weakBonus = (wasWeakArea && retries === 0) ? 1.5 : 1.0;
    
    return Math.max(10, Math.min(300, Math.floor(base * accuracyMult * speedMult * weakBonus)));
  }

  /**
   * Gets a weighted probability score for a concept based on mistake history.
   * Default weight is 10.
   */
  static getConceptWeight(concept: ConceptType, mistakeHistory: Record<string, MistakeRecord>): number {
    const record = mistakeHistory[concept];
    if (!record) return 10;
    return 10 + (record.frequency * record.severity * 5);
  }
}
