export function getRandomAmount(min: number, max: number, step: number = 100): number {
  return Math.floor((Math.random() * (max - min) + min) / step) * step;
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const COMPANIES = ['Jio', 'Airtel', 'Amazon', 'Tata', 'Reliance'];
const BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB'];
const FRAUD_DEPARTMENTS = ['Electricity Board', 'Income Tax Dept', 'CBI', 'Police'];

/**
 * Progressively blends difficulty as the user levels up.
 * Level 1: 100% Easy
 * Level 2: 85% Easy, 15% Medium (slowly entering medium)
 * Level 3: 70% Easy, 30% Medium
 * Level 4: 50% Easy, 50% Medium
 * Level 5: 30% Easy, 70% Medium
 * Level 6: 100% Medium
 * Level 7: 85% Medium, 15% Hard (slowly entering hard)
 * Level 8: 60% Medium, 40% Hard
 * Level 9+: 30% Medium, 70% Hard
 */
function getNaturalDifficulty(level: number): string {
  const rand = Math.random();
  if (level <= 1) return 'easy';
  if (level === 2) return rand < 0.85 ? 'easy' : 'medium';
  if (level === 3) return rand < 0.70 ? 'easy' : 'medium';
  if (level === 4) return rand < 0.50 ? 'easy' : 'medium';
  if (level === 5) return rand < 0.30 ? 'easy' : 'medium';
  if (level === 6) return 'medium';
  if (level === 7) return rand < 0.85 ? 'medium' : 'hard';
  if (level === 8) return rand < 0.60 ? 'medium' : 'hard';
  return rand < 0.30 ? 'medium' : 'hard';
}

/**
 * Procedural Fraud Case Generator based on user Level
 */
export function generateDynamicFraudCases(level: number, count: number = 5) {
  const cases = [];

  for (let i = 0; i < count; i++) {
    // Determine strict difficulty based on user Level
    let difficulty = getNaturalDifficulty(level);

    let isScam = Math.random() > 0.3; // 70% chance it's a scam to keep them on their toes

    const baseAmount = getRandomAmount(1000, 50000, 500);
    const smallAmount = getRandomAmount(100, 2000, 50);
    const bank = getRandomItem(BANKS);
    const company = getRandomItem(COMPANIES);

    let id = `gen_fc_${level}_${Date.now()}_${i}`;
    let title = "";
    let message = "";
    let redFlags: string[] = [];
    let explanation = "";
    let type = getRandomItem(['sms', 'call']);

    if (difficulty === 'easy') {
      if (isScam) {
        title = "Fake Lottery Win";
        message = `Congratulations! You won INR ${baseAmount} in ${company} lucky draw. Pay processing fee of INR ${smallAmount} via UPI to claim.`;
        redFlags = ["Asking for advance fee via UPI", "Fake lottery you never entered"];
        explanation = "Real lotteries and companies never ask for a processing fee upfront via UPI to release funds.";
      } else {
        title = "Bank Balance Update";
        message = `Dear Customer, Your A/c XXXXX is credited with INR ${baseAmount}. Available Balance: INR ${baseAmount + 1000}. - ${bank}`;
        redFlags = [];
        explanation = "This is a standard informational alert from the bank. It doesn't ask for OTPs or contain suspicious links.";
      }
    } else if (difficulty === 'medium') {
      if (isScam) {
        title = "Urgent KYC Update";
        message = `Dear User, Your ${bank} account will be suspended today due to pending KYC. Click link: http://${bank.toLowerCase()}-update-kyc.net to update now.`;
        redFlags = ["Creates false urgency (suspended today)", "Suspicious unverified link"];
        explanation = "Banks never send SMS with links to update KYC. Always visit the official bank app or branch.";
        type = 'sms';
      } else {
        title = "Official Loan Approval";
        message = `Namaste, Your SHG loan application for INR ${baseAmount} has been approved. Please visit your nearest branch to sign the documents.`;
        redFlags = [];
        explanation = "The message instructs you to visit the physical branch, which is a safe, standard procedure.";
      }
    } else {
      // Hard difficulty
      const dept = getRandomItem(FRAUD_DEPARTMENTS);
      if (isScam) {
        title = "Threatening Official";
        message = `This is the ${dept}. You have unpaid dues of INR ${baseAmount}. If you don't pay INR ${smallAmount} immediately to this number via UPI, an arrest warrant will be issued.`;
        redFlags = ["Threats of arrest/police action", "Asking for fine payment via UPI"];
        explanation = "Government departments do not call threatening arrest while demanding instant UPI transfers. This is a common intimidation scam.";
        type = 'call';
      } else {
        title = "Tax Refund Intimation";
        message = `Income Tax Department: A refund of INR ${smallAmount} for PAN XXXXXX is approved. It will be credited to your registered bank account shortly.`;
        redFlags = [];
        explanation = "This message merely informs you of an automated process. Notice it does NOT ask you to click a link or provide details.";
        type = 'sms';
      }
    }

    cases.push({
      id, title, type, difficulty, message, redFlags, isScam, explanation
    });
  }

  return cases;
}

/**
 * Procedural Scenarios Generator based on user Level
 */
export function generateDynamicScenarios(level: number, count: number = 5) {
    const scenarios = [];

    for(let i=0; i<count; i++) {
        let difficulty = getNaturalDifficulty(level);
        
        let id = `gen_sc_${level}_${Date.now()}_${i}`;
        const expenseAmount = getRandomAmount(1000, 5000, 500);
        const jarChoices = ['household', 'children', 'savings', 'emergency'];
        const primaryJar = getRandomItem(jarChoices);

        // We build a dynamic narrative based on difficulty
        let title = "Daily Budgeting Dilemma";
        let narrative = `You have an unexpected expense of INR ${expenseAmount} for a family need. Your ${primaryJar} jar is running low. What will you do?`;
        
        let choices = [];

        if (difficulty === 'easy') {
            title = "Simple Spending Choice";
            narrative = `You found a nice dress for the festival costing INR ${expenseAmount}. But you also need to save for next month's rent.`;
            choices = [
                { id: "c1", text: "Save the money for rent", isOptimal: true, impact: { finHealth: 5, xpReward: 50, feedback: "Great priority! Needs over wants." } },
                { id: "c2", text: "Buy the dress using rent money", isOptimal: false, impact: { finHealth: -5, xpReward: 10, feedback: "Missing rent payments can cause huge issues later." } }
            ];
        } else if (difficulty === 'medium') {
            title = "Medical and Savings Trade-off";
            narrative = `A minor medical issue requires INR ${expenseAmount}. You don't have enough in your emergency jar. Where will you pull the funds from?`;
            choices = [
                { id: "c1", text: "Reallocate from savings jar", isOptimal: true, impact: { finHealth: 3, xpReward: 80, feedback: "Smart! Savings are meant to backup emergencies." } },
                { id: "c2", text: "Take a high-interest loan from a moneylender", isOptimal: false, impact: { finHealth: -10, xpReward: 20, feedback: "Avoid local moneylenders for small amounts; their interest rates are predatory." } },
                { id: "c3", text: "Ignore the medical issue", isOptimal: false, impact: { finHealth: -8, xpReward: 5, feedback: "Ignoring health issues leads to larger costs down the line." } }
            ];
        } else {
            title = "Investment vs Immediate Need";
            narrative = `You are offered a scheme to expand your small business requiring INR ${expenseAmount}. But you also need to cover upcoming children's education fees of INR ${Math.floor(expenseAmount*0.8)}.`;
            choices = [
                { id: "c1", text: "Delay business, pay education fees", isOptimal: true, impact: { finHealth: 8, xpReward: 150, feedback: "Education is the safest, most vital investment. Business can scale later." } },
                { id: "c2", text: "Invest in business, delay school fees", isOptimal: false, impact: { finHealth: -2, xpReward: 50, feedback: "Business is risky. Ensuring your children's ongoing education provides guaranteed stability." } },
                { id: "c3", text: "Take a bank loan for the business to pay both", isOptimal: true, impact: { finHealth: 5, xpReward: 120, feedback: "Leveraging official credit for business expansion is a valid financial strategy!" } }
            ];
        }

        scenarios.push({
            id, title, narrative, difficulty, category: 'budgeting', choices
        });
    }

    return scenarios;
}