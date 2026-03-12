export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  impact: {
    jar: 'household' | 'children' | 'savings' | 'emergency';
    amount: number;
  };
  probability: number; // 0-1
  severity: 'low' | 'medium' | 'high';
  xpReward: number;
}

export const lifeEvents: LifeEvent[] = [
  {
    id: 'le1',
    title: 'Medical Emergency',
    description: 'Your child has a high fever and needs to visit the doctor. Medicine costs ₹1,500.',
    impact: { jar: 'emergency', amount: -1500 },
    probability: 0.3,
    severity: 'medium',
    xpReward: 150,
  },
  {
    id: 'le2',
    title: 'Roof Leak Repair',
    description: 'Heavy monsoon rains damaged your roof. Repair costs ₹2,000.',
    impact: { jar: 'emergency', amount: -2000 },
    probability: 0.2,
    severity: 'high',
    xpReward: 200,
  },
  {
    id: 'le3',
    title: 'Wedding Invitation',
    description: "Your cousin's wedding is next month. You need ₹1,000 for a gift and travel.",
    impact: { jar: 'children', amount: -1000 }, // Using children as discretionary
    probability: 0.25,
    severity: 'low',
    xpReward: 100,
  },
  {
    id: 'le4',
    title: 'School Books Needed',
    description: 'New term starts — school books and uniform cost ₹1,800.',
    impact: { jar: 'children', amount: -1800 },
    probability: 0.35,
    severity: 'medium',
    xpReward: 150,
  },
  {
    id: 'le5',
    title: 'Bonus Income!',
    description: 'Your SHG received a government subsidy. Your share is ₹2,000!',
    impact: { jar: 'savings', amount: 2000 },
    probability: 0.15,
    severity: 'low',
    xpReward: 50,
  },
  {
    id: 'le6',
    title: 'Phone Repair',
    description: 'Your phone screen cracked. Repair costs ₹800.',
    impact: { jar: 'household', amount: -800 },
    probability: 0.2,
    severity: 'low',
    xpReward: 80,
  },
  {
    id: 'le7',
    title: 'Crop Damage',
    description: 'Unseasonal rain damaged your small vegetable garden. Loss of ₹1,200 in produce.',
    impact: { jar: 'household', amount: -1200 },
    probability: 0.15,
    severity: 'medium',
    xpReward: 120,
  },
];

export function triggerRandomLifeEvent(force: boolean = false): LifeEvent | null {
  if (force) {
    return lifeEvents[Math.floor(Math.random() * lifeEvents.length)];
  }
  const roll = Math.random();
  const candidates = lifeEvents.filter((e) => roll <= e.probability);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
