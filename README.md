<div align="center">
  <h1>🌸 Sakhi's Ledger 🌸</h1>
  <p><b>Empowering Women in India through Gamified Financial Literacy</b></p>

  <!-- Badges -->
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://redux-toolkit.js.org/"><img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" /></a>
  <br />
  <img src="https://img.shields.io/badge/Status-Hackathon_Ready-success.svg" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" />
</div>

<br />

> **⚠️ NO-CHANGE WARNING**  
> This repository is submitted as-is for hackathon evaluation. Please **do not merge pull requests, push new branches, or alter any file** until the judges have completed their review. Thank you.

---

## 📖 About the Project

**Sakhi's Ledger** is a culturally-tailored, gamified financial literacy app built for women in Self-Help Groups (SHGs) across rural and semi-urban India. It breaks language and literacy barriers by combining localised vernacular support (9 Indian languages), voice-guided TTS audio, and experiential simulation-based learning — all 100% offline-first.

> **Access Email for Judges:** `kishore1803dev@gmail.com`  
> **Repo:** [github.com/Kishore-1803/Sakhis-Ledger](https://github.com/Kishore-1803/Sakhis-Ledger)

---

## 🎯 3 Key User Flows (Rule of 3)

### Flow 1 — Onboard & Personalise
```
Launch App
  └─► Choose Language (9 options: English, Hindi, Tamil, Telugu, Bengal, Kannada, Marathi, Gujarati, Malayalam)
  └─► Enable Audio Guidance (TTS)
  └─► Pick Your Guide (Savitri Didi — Earning Woman / Shanti Didi — Household CFO)
  └─► Enter Your Name
  └─► Begin your Financial Adventure ✅
```

### Flow 2 — Daily Mission Loop (Timed ⏳)
```
Open App each day
  └─► 4-hour mission window begins automatically
  └─► Complete all 4 daily missions within the window = FULL XP + Daily Hero Badge
  └─► Miss the window → still completable but only 30% XP
  └─► Missions: Quest | Scam Arena | Savings Jar | Life Event
  └─► Streak counter increments for optimal daily play 🔥
```

### Flow 3 — Scam Buster Arena
```
Navigate to Arena tab
  └─► 5 freshly generated scam cases (SMS / Call) per day, difficulty scales with Level
  └─► Read (or hear 🔊) the suspicious message
  └─► Judge: SAFE or SCAM?
  └─► Correct → +100 XP + streak flash effect (green overlay)
  └─► Wrong → +20 XP + shake animation + red flags revealed
  └─► Beat 5 total → unlock "Scam Buster" badge 🛡️
```

---

## 🏆 3 Core Features / Value Pillars

| Pillar | Feature | Impact |
|--------|---------|--------|
| 🎮 **Gamified Learning** | XP, Levels, Streaks, Daily Timed Missions | Sustains daily engagement through progression hooks |
| 🛡️ **Scam Awareness** | AI-generated fraud simulations (UPI, KYC, Lottery) | Directly protects women from real-world digital scams |
| 💼 **Jar Budgeting** | Visual money allocation across 4 life buckets | Builds actionable savings habits grounded in real life |

---

## 🎮 Gamification — 3 Pillars

1. **XP & Levels** — Earned on every interaction (quest, scam case, jar allocation, life event). Level threshold increases progressively (+500 XP per tier), keeping the challenge fresh forever.

2. **Leaderboard & Badges** — SHG Community Leaderboard ranks the user against fictional peers in their village group. 7 earnable Badges unlock automatically as milestones are hit (First Quest, Scam Buster, Saver Star, 3-Day Warrior, Week Champion, Level 5 Hero, Daily Hero).

3. **Daily Timed Rewards** — A **4-hour mission window** opens each morning. All 4 missions completed on time = Full XP + Daily Hero badge. Completing after expiry = 30% XP cap, creating genuine urgency without punishing casual users.

---

## 🗺️ App Architecture Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│                      SAKHI'S LEDGER                         │
│                   (Expo / React Native)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┴──────────────────┐
           │          First Launch?            │
           │                                  │
           ▼ YES                              ▼ NO (Persisted State)
   ┌───────────────┐                  ┌───────────────────┐
   │  Onboarding   │                  │   Main App Shell  │
   │  4-Step Flow  │                  │  (Tab Navigator)  │
   └───────┬───────┘                  └────────┬──────────┘
           │                                   │
           │ completeOnboarding()    ┌──────────┼──────────┐──────────────┐
           │                        │          │          │              │
           ▼                      Home      Quests      Jars          Arena
   ┌───────────────┐            ┌──────┐  ┌───────┐  ┌──────┐      ┌────────┐
   │  Redux Store  │            │ Daily│  │Scen.  │  │ Jar  │      │ Scam   │
   │  + AsyncStore │◄──────────►│Timer │  │Detail │  │Alloc.│      │Buster  │
   │  (Persist)    │            │Banner│  │ +XP   │  │ +XP  │      │ +XP    │
   └───────────────┘            └──────┘  └───────┘  └──────┘      └────────┘
           │
   ┌───────┴───────┐
   │  Procedural   │
   │  Content Gen  │  ← Generates 5 scam+scenario cases daily per user Level
   └───────────────┘
```

---

## 📴 Offline / Rural Usability

- **100% On-Device Storage** — Redux Persist + AsyncStorage. No internet required after install.
- **Audio Guidance** — Expo Speech TTS reads all scenario text, so low-literacy users can participate.
- **9 Languages** — Covers all major Indian language groups, including regional scripts.
- **Low Data Footprint** — No images, no video, no server calls. APK size ~30MB, runs on 2G-connected budget Android phones.
- **Designed for Feature Phones / Low RAM** — AnimatedAPI uses `useNativeDriver`, no heavy animations on web.

---

## ✅ Feasibility (Mass Adoption)

> *Plugs directly into India's 6.8 lakh existing SHG infrastructure as a free PWA/APK distributed by NGOs via WhatsApp — no app store required.*

---

## ⚠️ Limitation

> *Progress is device-local only (no cloud sync across phones); a woman's data resets if her phone is lost or reset.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 51 |
| Language | TypeScript |
| State | Redux Toolkit + redux-persist |
| Storage | AsyncStorage (offline-first) |
| Audio | Expo Speech (TTS, 9 languages) |
| Icons | @expo/vector-icons (Feather + MaterialCommunityIcons) |

---

## 📂 Project Structure

```bash
Sakhis-Ledger/
├── App.tsx               # Root navigator, daily session init, badge watcher
├── components/
│   ├── TopHeader.tsx     # Gamified header: XP bar, level, streak, trophy button
│   ├── DailyTimerBanner.tsx  # ⏳ 4-hour countdown mission window
│   ├── LeaderboardModal.tsx  # 🏆 SHG leaderboard + badges collection
│   ├── LanguageSettingsModal.tsx  # Settings + LOGOUT (per-user state clear)
│   └── ...               # JarCard, HealthMeter, ScenarioCard, etc.
├── screens/
│   ├── HomeScreen.tsx    # Daily missions (timed), jar overview
│   ├── ScamBusterScreen.tsx  # Arena — daily generated fraud cases
│   ├── ScenariosScreen.tsx   # Quests list
│   ├── ScenarioDetailScreen.tsx  # Quest interaction + result modal
│   └── JarsScreen.tsx    # Budget allocation
├── store/
│   ├── userSlice.ts      # XP, level, streak, badges, daily session
│   └── simulationSlice.ts  # Jars, scenarios, scams, health score
├── engine/
│   ├── contentGenerator.ts  # Procedural scam + scenario generator
│   └── simulationEngine.ts  # Game logic helpers
└── utils/
    ├── i18n.ts           # 9-language translation dictionary
    └── audioEngine.ts    # TTS wrapper
```

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/Kishore-1803/Sakhis-Ledger.git
cd Sakhis-Ledger

# 2. Install
npm install

# 3. Run
npx expo start

# 4. Open
# Press 'a' → Android Emulator
# Press 'i' → iOS Simulator
# Scan QR → Expo Go on physical device
```

---

<div align="center">
  Made with ❤️ for financial literacy in rural India.
</div>