<div align="center">
  <img src="https://img.icons8.com/color/120/000000/ledger.png" alt="Logo">
  <h1>🌸 Sakhi's Ledger 🌸</h1>
  <p><b>Empowering Women in India through Gamified Financial Literacy</b></p>

  <!-- Badges -->
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://redux-toolkit.js.org/"><img src="https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
  <br />
  <img src="https://img.shields.io/badge/Status-Active-success.svg" alt="Status Active" />
  <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg" alt="Contributions Welcome" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" />
</div>

<br />

## 📖 About the Project

**Sakhi's Ledger** is a culturally tailored, gamified financial learning app designed specifically for women in Self-Help Groups (SHGs) across India. It breaks language and literacy barriers by combining localized vernacular support, audio-guided text-to-speech, and experiential learning.

Through an engaging level-based progression system, users learn essential financial concepts—from safe budgeting using the "Jar" method to recognizing modern digital UPI scams.

---

## ✨ Key Features

- **🎮 Gamified Learning Engine:** Users earn XP, build daily streaks, and level up. Difficulty adjusts dynamically using a natural progression curve based on the user's level.
- **🛡️ ScamBuster Arena:** A procedurally generated simulation where users analyze SMS and call-based fraud attempts (Fake KYC, Bank updates, Lottery scams) to spot "Red Flags".
- **💼 Visual "Jar" Budgeting:** Hands-on experience dividing monthly income into core buckets (Household, Children, Savings, Emergency).
- **🎲 Dynamic Life Events:** The game naturally throws unexpected daily events (medical issues, festival expenses) to test the user's financial resilience.
- **🗣️ Vernacular & Audio Inclusion:** Supports 9 Indian languages (Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam, Marathi, Gujarati, English) with a built-in `AudioEngine` that reads scenarios aloud.
- **📱 Offline-First & Lightweight:** Redux state persistence ensures the app functions completely offline for users with intermittent internet access.

---

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **State Management:** Redux Toolkit (with persistence modeling)
- **Styling:** Tailwind CSS (via NativeWind)
- **Accessibility:** Expo Speech for deep Audio Text-to-Speech

---

## 📂 Architecture Organization

```bash
sakhi-app/
├── assets/         # Images, fonts, and static resources
├── components/     # Reusable UI elements (Headers, Cards, Modals)
├── constants/      # App-wide color scheme and styling theme variables
├── data/           # Initial mock JSON structures
├── engine/         # Core game logic (Procedural Generators, Simulators)
├── screens/        # Navigation screens (Home, ScamBuster, Scenarios, Jars)
├── store/          # Redux Toolkit slices (User Progress, Simulation State)
└── utils/          # Deep logic (i18n transliteration, AudioEngine wrapper)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js and Expo CLI installed on your machine.
- Node.js: `v16.0+`
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kishore-1803/Sakhis-Ledger.git
   cd Sakhis-Ledger
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Expo Development Server:**
   ```bash
   npx expo start
   ```

4. **Test the app:**
   - Press `a` to open in Android Emulator
   - Press `i` to open in iOS Simulator
   - Scan the QR code with the Expo Go app on your physical device

---

## 🧠 The Procedural Engine

The app avoids repetitive static questions by using a **Procedural Content Generator** (`engine/contentGenerator.ts`). It generates 5 new scenarios and scam cases daily.

```typescript
// The generator automatically shapes the difficulty gradient 
// from 100% easy at level 1, blending into 70% hard at level 9+
function getNaturalDifficulty(level: number): string { ... }
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ for financial literacy.
</div>