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

const LOTTERY_SCAM_TEMPLATES = [
  (company: string, amount: number, fee: number) =>
    `Congratulations! You won INR ${amount} in ${company} lucky draw. Pay processing fee of INR ${fee} via UPI to claim.`,
  (company: string, amount: number, fee: number) =>
    `${company} Festival Bonanza! Your number has been selected for INR ${amount}. Send INR ${fee} processing charge to receive prize.`,
  (company: string, amount: number, fee: number) =>
    `Winner Alert! ${company} promotion selected you for INR ${amount}. To release funds, pay INR ${fee} verification charge.`,
  (company: string, amount: number, fee: number) =>
    `Dear Customer, your mobile has won INR ${amount} in ${company} Mega Draw. Deposit INR ${fee} to activate payout.`
];

const KYC_SCAM_TEMPLATES = [
  (bank: string) => `Dear Customer, your ${bank} account will be blocked today due to incomplete KYC. Update immediately: http://${bank.toLowerCase()}-kyc-update.net`,
  (bank: string) => `${bank} ALERT: Your account verification failed. Complete KYC within 2 hours here: http://${bank.toLowerCase()}secure.net`,
  (bank: string) => `Important Notice from ${bank}. Your account services are suspended. Submit KYC details at http://${bank.toLowerCase()}-verify.info`,
  (bank: string) => `${bank}: Security update required. Click below to avoid account freeze: http://${bank.toLowerCase()}-update-kyc.co`
];

const GOV_SCAM_TEMPLATES = [
  (dept: string, amount: number, fine: number) => `This is the ${dept}. You have unpaid dues of INR ${amount}. Pay INR ${fine} immediately via UPI to avoid legal action.`,
  (dept: string, amount: number, fine: number) => `${dept} Notice: Outstanding penalty of INR ${amount}. Immediate payment of INR ${fine} required to prevent arrest.`,
  (dept: string, amount: number, fine: number) => `Legal Warning from ${dept}. Case filed for unpaid amount INR ${amount}. Settle INR ${fine} now to close case.`,
  (dept: string, amount: number, fine: number) => `${dept}: Your documents show pending dues INR ${amount}. Failure to pay INR ${fine} will trigger police action.`
];

const BANK_ALERT_TEMPLATES = [
  (bank: string, amount: number, bAmount: number) => `Dear Customer, Your A/c XXXXX is credited with INR ${amount}. Available Balance: INR ${bAmount}. - ${bank}`,
  (bank: string, amount: number, bAmount: number) => `${bank} Alert: Deposit of INR ${amount} successful. Total balance INR ${bAmount}.`,
  (bank: string, amount: number, bAmount: number) => `Transaction Update: Your account received INR ${amount}. Thank you for banking with ${bank}.`,
  (bank: string, amount: number, bAmount: number) => `${bank}: Your balance has been updated after credit of INR ${amount}.`
];

const LEGIT_LOAN_TEMPLATES = [
  (amount: number) => `Namaste, Your SHG loan application for INR ${amount} has been approved. Please visit your nearest branch to sign the documents.`,
  (amount: number) => `Your personal loan request for INR ${amount} is sanctioned. Kindly bring original KYC documents to the branch.`,
  (amount: number) => `Loan Update: INR ${amount} loan is ready for approval. Visit the bank strictly during working hours to complete formalities.`
];

const LEGIT_TAX_TEMPLATES = [
  (amount: number) => `Income Tax Department: A refund of INR ${amount} for PAN XXXXXX is approved. It will be credited to your registered bank account shortly.`,
  (amount: number) => `Govt of India: Your tax return has been processed. A refund of INR ${amount} will be automatically sent to your linked account.`,
  (amount: number) => `IT Dept Process Update: Claim for INR ${amount} verified. No further action needed. Amount will reflect in 3-5 working days.`
];

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
        message = getRandomItem(LOTTERY_SCAM_TEMPLATES)(company, baseAmount, smallAmount);
        redFlags = ["Asking for advance fee via UPI", "Fake lottery you never entered"];
        explanation = "Real lotteries and companies never ask for a processing fee upfront via UPI to release funds.";
      } else {
        title = "Bank Balance Update";
        const totalBal = baseAmount + getRandomAmount(500, 5000, 100);
        message = getRandomItem(BANK_ALERT_TEMPLATES)(bank, baseAmount, totalBal);
        redFlags = [];
        explanation = "This is a standard informational alert from the bank. It doesn't ask for OTPs or contain suspicious links.";
      }
    } else if (difficulty === 'medium') {
      if (isScam) {
        title = "Urgent KYC Update";
        message = getRandomItem(KYC_SCAM_TEMPLATES)(bank);
        redFlags = ["Creates false urgency", "Suspicious unverified link"];
        explanation = "Banks never send SMS with links to update KYC. Always visit the official bank app or branch.";
        type = 'sms';
      } else {
        title = "Official Loan Approval";
        message = getRandomItem(LEGIT_LOAN_TEMPLATES)(baseAmount);
        redFlags = [];
        explanation = "The message instructs you to visit the physical branch, which is a safe, standard procedure.";
      }
    } else {
      // Hard difficulty
      const dept = getRandomItem(FRAUD_DEPARTMENTS);
      if (isScam) {
        title = "Threatening Official";
        message = getRandomItem(GOV_SCAM_TEMPLATES)(dept, baseAmount, smallAmount);
        redFlags = ["Threats of arrest/police action", "Asking for fine payment via UPI"];
        explanation = "Government departments do not call threatening arrest while demanding instant UPI transfers. This is a common intimidation scam.";
        type = 'call';
      } else {
        title = "Tax Refund Intimation";
        message = getRandomItem(LEGIT_TAX_TEMPLATES)(smallAmount);
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

const EASY_SCENARIOS = [
  (amount: number, jar: string) => ({
    title: "Festival Shopping vs Savings",
    narrative: `You found a beautiful festival dress costing INR ${amount}. But you also need to set aside money for next month's rent.`,
    choices: [
        { id: "c1", text: "Save the money for rent", isOptimal: true, impact: { finHealth: 5, xpReward: 50, feedback: "Great priority! Needs over wants." } },
        { id: "c2", text: "Buy the dress using rent money", isOptimal: false, impact: { finHealth: -5, xpReward: 10, feedback: "Missing rent payments can cause huge issues later." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Tempting Discount",
    narrative: `There is a 50% discount on a smartphone you wanted, costing INR ${amount}. You have enough in your ${jar} jar, but it was meant for utilities.`,
    choices: [
        { id: "c1", text: "Skip the phone, keep utility money", isOptimal: true, impact: { finHealth: 5, xpReward: 50, feedback: "Smart choice. Utilities are essential." } },
        { id: "c2", text: "Buy the phone, figure out utilities later", isOptimal: false, impact: { finHealth: -5, xpReward: 10, feedback: "Neglecting regular bills for gadgets leads to debt." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Family Celebration",
    narrative: `A relative is hosting a party and expecting a gift worth INR ${amount}. You mostly have funds in your ${jar} jar.`,
    choices: [
        { id: "c1", text: "Give a smaller, affordable gift instead", isOptimal: true, impact: { finHealth: 4, xpReward: 40, feedback: "It's the thought that counts, not the price tag." } },
        { id: "c2", text: "Empty the jar to buy the expensive gift", isOptimal: false, impact: { finHealth: -4, xpReward: 10, feedback: "Social pressure shouldn't ruin your budget." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Bulk Grocery Offer",
    narrative: `A local wholesaler offers a bulk sack of rice for INR ${amount}, saving you 20% long-term. Your ${jar} jar has exactly this much.`,
    choices: [
        { id: "c1", text: "Buy in bulk to save long-term", isOptimal: true, impact: { finHealth: 6, xpReward: 50, feedback: "Excellent! Bulk buying non-perishables reduces future monthly costs." } },
        { id: "c2", text: "Pass on it to keep cash free", isOptimal: false, impact: { finHealth: 0, xpReward: 20, feedback: "It is okay, but you missed a chance to reduce future expenses." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Impulse Toy Buy",
    narrative: `Your child is begging for a fancy remote-control car worth INR ${amount}. The 'children' jar is currently empty.`,
    choices: [
        { id: "c1", text: "Explain the budget and say no", isOptimal: true, impact: { finHealth: 5, xpReward: 50, feedback: "Setting financial boundaries with children is an important life lesson." } },
        { id: "c2", text: "Take money from emergency jar to buy it", isOptimal: false, impact: { finHealth: -6, xpReward: 5, feedback: "Using emergency funds for toys leaves you vulnerable to real crises." } }
    ]
  })
];

const MEDIUM_SCENARIOS = [
  (amount: number, jar: string) => ({
    title: "Unexpected Home Repair",
    narrative: `Your house roof is leaking and repair costs INR ${amount}. Your emergency fund is small.`,
    choices: [
        { id: "c1", text: "Use emergency fund + reduce home expenses", isOptimal: true, impact: { finHealth: 3, xpReward: 80, feedback: "Good! Emergencies are what the fund is for." } },
        { id: "c2", text: "Take a fast loan from an unregistered lender", isOptimal: false, impact: { finHealth: -10, xpReward: 20, feedback: "Unregistered lenders charge massive interest." } },
        { id: "c3", text: "Ignore the leak", isOptimal: false, impact: { finHealth: -8, xpReward: 5, feedback: "Ignoring repairs usually leads to far bigger damages." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Sudden Medical Bill",
    narrative: `A family member needs sudden clinical tests costing INR ${amount}. Your ${jar} jar has just enough.`,
    choices: [
        { id: "c1", text: "Reallocate funds from other jars for health", isOptimal: true, impact: { finHealth: 4, xpReward: 80, feedback: "Health is wealth. Always prioritize medical needs." } },
        { id: "c2", text: "Delay tests until next month's salary", isOptimal: false, impact: { finHealth: -6, xpReward: 15, feedback: "Delaying medical tests can worsen the condition." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "School Trip Expense",
    narrative: `Your child's school is organizing a trip costing INR ${amount}. This wasn't planned in your ${jar} budget.`,
    choices: [
        { id: "c1", text: "Discuss with child and skip if unaffordable", isOptimal: true, impact: { finHealth: 3, xpReward: 60, feedback: "Honest communication about finances prevents debt." } },
        { id: "c2", text: "Borrow money from neighbors", isOptimal: false, impact: { finHealth: -3, xpReward: 15, feedback: "Borrowing for non-essentials strains relationships and finances." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Relative Wants a Loan",
    narrative: `A close relative is asking to borrow INR ${amount} for a business venture. You have this in your savings.`,
    choices: [
        { id: "c1", text: "Analyze their plan carefully before lending", isOptimal: true, impact: { finHealth: 4, xpReward: 70, feedback: "Treat family loans as business. Ensure they have a way to repay." } },
        { id: "c2", text: "Politely decline to protect your savings", isOptimal: true, impact: { finHealth: 6, xpReward: 60, feedback: "Protecting your own financial stability first is a safe move!" } },
        { id: "c3", text: "Blindly give the money out of guilt", isOptimal: false, impact: { finHealth: -8, xpReward: 5, feedback: "Lending without checks often ruins both the relationship and your savings." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Two-Wheeler Breakdown",
    narrative: `Your scooter broke down on the way to work. Fixing it requires INR ${amount}. Without it, daily travel costs double.`,
    choices: [
        { id: "c1", text: "Fix it immediately using the emergency fund", isOptimal: true, impact: { finHealth: 5, xpReward: 80, feedback: "Fixing assets that generate income or save money is vital." } },
        { id: "c2", text: "Leave it broken and pay double for daily commute", isOptimal: false, impact: { finHealth: -5, xpReward: 10, feedback: "Long-term daily costs will quickly exceed the one-time repair cost." } }
    ]
  })
];

const HARD_SCENARIOS = [
  (amount: number, jar: string) => ({
    title: "Investment vs Immediate Need",
    narrative: `You are offered a scheme to expand your small business requiring INR ${amount}. But you also need to cover upcoming children's education fees of INR ${Math.floor(amount*0.8)}.`,
    choices: [
        { id: "c1", text: "Delay business, pay education fees", isOptimal: true, impact: { finHealth: 8, xpReward: 150, feedback: "Education is the safest, most vital investment." } },
        { id: "c2", text: "Invest in business, delay school fees", isOptimal: false, impact: { finHealth: -2, xpReward: 50, feedback: "Business is risky. Child's education is a guaranteed foundation." } },
        { id: "c3", text: "Apply for a formal bank SME loan", isOptimal: true, impact: { finHealth: 6, xpReward: 130, feedback: "Using formal credit to grow while paying fees is smart." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Job Relocation Trap",
    narrative: `A recruiter calls promising a better job, but demands an upfront security deposit of INR ${amount} via bank transfer.`,
    choices: [
        { id: "c1", text: "Refuse to pay. Real jobs don't ask for deposits.", isOptimal: true, impact: { finHealth: 10, xpReward: 150, feedback: "Excellent! Advance fee job offers are 100% scams." } },
        { id: "c2", text: "Pay the deposit using savings", isOptimal: false, impact: { finHealth: -15, xpReward: 0, feedback: "You just lost your savings to a classic job scam." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Gold Loan vs Land Sale",
    narrative: `A major family crisis requires INR ${amount * 5}. You can either pledge family gold or sell a small piece of land quickly at a loss.`,
    choices: [
        { id: "c1", text: "Pledge gold for a secure bank loan", isOptimal: true, impact: { finHealth: 5, xpReward: 120, feedback: "Gold loans from regulated banks are safer and keep your assets intact long-term." } },
        { id: "c2", text: "Sell the land in a panic at a huge loss", isOptimal: false, impact: { finHealth: -12, xpReward: 20, feedback: "Panic selling real estate removes your biggest wealth builder." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Debt Consolidation Offer",
    narrative: `You have 3 running loans. An agent offers to combine them into one loan of INR ${amount * 3}, but the interest rate is not clearly written in the document.`,
    choices: [
        { id: "c1", text: "Demand the written terms before signing anything", isOptimal: true, impact: { finHealth: 9, xpReward: 140, feedback: "Always read the fine print! Hidden interest rates are dangerous." } },
        { id: "c2", text: "Sign it to reduce the headache of 3 loans", isOptimal: false, impact: { finHealth: -10, xpReward: 10, feedback: "Blindly rolling over debt can trap you in an explosive interest cycle." } }
    ]
  }),
  (amount: number, jar: string) => ({
    title: "Unexpected Tax/Legal Fee",
    narrative: `A local dispute requires a legal fee of INR ${amount}. A local strongman offers to 'settle it' for half the price without courts.`,
    choices: [
        { id: "c1", text: "Pay the official legal fee using savings", isOptimal: true, impact: { finHealth: 4, xpReward: 110, feedback: "Staying strictly within the law removes leverage against you." } },
        { id: "c2", text: "Pay the strongman to save money", isOptimal: false, impact: { finHealth: -15, xpReward: 0, feedback: "Illegal settlements often lead to blackmail or bigger losses." } }
    ]
  })
];

function getUniqueTemplate(templates: any[], usedSet: Set<number>) {
  if (usedSet.size >= templates.length) {
    usedSet.clear(); // Reset if we ran out of unique ones
  }
  let idx;
  do {
    idx = Math.floor(Math.random() * templates.length);
  } while (usedSet.has(idx));
  usedSet.add(idx);
  return templates[idx];
}

/**
 * Procedural Scenarios Generator based on user Level
 */
export function generateDynamicScenarios(level: number, count: number = 5) {
    const scenarios = [];
    const usedEasiestIndices = new Set<number>();
    const usedMediumIndices = new Set<number>();
    const usedHardIndices = new Set<number>();

    for(let i=0; i<count; i++) {
        let difficulty = getNaturalDifficulty(level);
        
        let id = `gen_sc_${level}_${Date.now()}_${i}`;
        const expenseAmount = getRandomAmount(1000, 5000, 500);
        const jarChoices = ['household', 'children', 'savings', 'emergency'];
        const primaryJar = getRandomItem(jarChoices);

        let scenarioData;
        if (difficulty === 'easy') {
            scenarioData = getUniqueTemplate(EASY_SCENARIOS, usedEasiestIndices)(expenseAmount, primaryJar);
        } else if (difficulty === 'medium') {
            scenarioData = getUniqueTemplate(MEDIUM_SCENARIOS, usedMediumIndices)(expenseAmount, primaryJar);
        } else {
            scenarioData = getUniqueTemplate(HARD_SCENARIOS, usedHardIndices)(expenseAmount, primaryJar);
        }

        scenarios.push({
            id, 
            title: scenarioData.title, 
            narrative: scenarioData.narrative, 
            difficulty, 
            category: 'budgeting', 
            choices: scenarioData.choices
        });
    }

    return scenarios;
}