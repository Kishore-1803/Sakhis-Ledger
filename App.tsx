import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store, persistor, switchUserProfile, RootState } from './store/store';
import { Persistor } from 'redux-persist';
import { setLastActiveDate, setActiveContent } from './store/simulationSlice';
import { setDailyDeadline, unlockBadge, resumeDailyTimer } from './store/userSlice';
import { decayJarHealth } from './store/engagementSlice';
import { isEndOfMonth } from './engine/simulationEngine';
import { generateDynamicFraudCases, generateDynamicScenarios } from './engine/contentGenerator';
import { useTheme } from './utils/useTheme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TranslatedText from './components/TranslatedText';
import { JarRescueModal } from './components/JarRescueModal';
import { TreeGrowthModal } from './components/TreeGrowthModal';
import {
  nameToSlug,
  registerProfile,
} from './store/profileRegistry';
import { SessionContext } from './utils/SessionContext';

// A ref to the NavigationContainer so we can imperatively reset navigation on logout
const navigationRef = createNavigationContainerRef();

import HomeScreen from './screens/HomeScreen';
import ScenariosScreen from './screens/ScenariosScreen';
import JarsScreen from './screens/JarsScreen';
import ScamBusterScreen from './screens/ScamBusterScreen';
import FortuneTreeScreen from './screens/FortuneTreeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import ScenarioDetailScreen from './screens/ScenarioDetailScreen';
import InsightsDashboardScreen from './screens/InsightsDashboardScreen';
import StoryScreen from './screens/StoryScreen';
import MonthEndReportModal from './components/MonthEndReportModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Session State ────────────────────────────────────────────────────────────
//
// "activeSlug" lives OUTSIDE Redux so it persists across a resetUser() call.
// It is stored in React state at the root `App` level, passed down via
// render props.  A null slug means "show Login screen".

function TabNavigator() {
  const lang = useSelector((state: RootState) => state.user.language || 'en');
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBg,
          borderTopWidth: 2,
          borderTopColor: '#FFD70040',
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          letterSpacing: 0.5,
        },
        tabBarLabel: ({ focused, color }) => {
          let label = route.name;
          if (route.name === 'Home') label = 'Home';
          if (route.name === 'Quests') label = 'Quests';
          if (route.name === 'Jars') label = 'Jars';
          if (route.name === 'Tree') label = 'Tree';
          if (route.name === 'Arena') label = 'Arena';
          return <TranslatedText text={label} lang={lang} style={{ color, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 }} />;
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Quests"
        component={ScenariosScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="star" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Jars"
        component={JarsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="briefcase" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tree"
        component={FortuneTreeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="tree" focused={focused} IconSet={MaterialCommunityIcons} />
          ),
        }}
      />
      <Tab.Screen
        name="Arena"
        component={ScamBusterScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="shield" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ name, focused, IconSet = Feather }: { name: any; focused: boolean; IconSet?: any }) {
  const theme = useTheme();
  return (
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: focused ? '#FFD70025' : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: focused ? 1.5 : 0,
      borderColor: '#FFD70050',
    }}>
      <IconSet name={name} size={focused ? 24 : 20} color={focused ? theme.tabActive : theme.tabInactive} />
    </View>
  );
}

// ─── AppNavigator ─────────────────────────────────────────────────────────────

interface AppNavigatorProps {
  activeSlug: string | null;
  onLogin: (newPersistor: Persistor, slug: string) => void;
  onNewUserLogin: (newPersistor: Persistor, slug: string) => void;
  onLogout: () => void;
  pendingNewName: string | null;
  onSetPendingName: (name: string) => void;
  isExistingPlayer: boolean | null;
}

function AppNavigator({
  activeSlug, onLogin, onNewUserLogin, onLogout, pendingNewName, onSetPendingName, isExistingPlayer,
}: AppNavigatorProps) {
  const dispatch = useDispatch();
  const hasOnboarded = useSelector((state: RootState) => state.user.hasOnboarded);
  const userName    = useSelector((state: RootState) => state.user.name);
  const userAvatar  = useSelector((state: RootState) => state.user.avatar);
  const sim         = useSelector((state: RootState) => state.simulation);
  const guide       = useSelector((state: RootState) => state.user.guide);
  const jarHealthState = useSelector((state: RootState) => state.engagement?.jarHealth);

  const [showMonthEnd, setShowMonthEnd] = useState(false);
  const [jarRescueVisible, setJarRescueVisible] = useState(false);
  const [criticalJar, setCriticalJar] = useState<'household' | 'children' | 'savings' | 'emergency' | null>(null);
  const [showTreeGrowth, setShowTreeGrowth] = useState(false);
  const [newTreeTier, setNewTreeTier] = useState<number | null>(null);

  // Track previous value so we only react when it actually flips to false
  const prevHasOnboarded = useRef(hasOnboarded);

  // ── When onboarding completes, register the profile ────────────────────────
  useEffect(() => {
    if (prevHasOnboarded.current === false && hasOnboarded && userName) {
      // Just finished onboarding — register this player in the global registry
      registerProfile({
        name: userName,
        lastLogin: Date.now(),
        avatar: userAvatar || '👩',
      });
    }
    prevHasOnboarded.current = hasOnboarded;
  }, [hasOnboarded, userName]);

  // ── Update lastLogin timestamp each time an existing user resumes ──────────
  useEffect(() => {
    if (hasOnboarded && userName && activeSlug) {
      registerProfile({
        name: userName,
        lastLogin: Date.now(),
        avatar: userAvatar || '👩',
      });
    }
  }, [activeSlug]); // only on first load of this profile

  // ── Daily session window init ───────────────────────────────────────────────
  const lastSessionDate = useSelector((state: RootState) => state.user.lastSessionDate);
  const dailyTimeRemaining = useSelector((state: RootState) => state.user.dailyTimeRemaining);
  // ── Daily session window init ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeSlug) return;
    
    setTimeout(() => {
      const currentUser = store.getState().user;
      const todayStr = new Date().toISOString().split('T')[0];
      
      const isMissing = !currentUser.dailyDeadline || currentUser.dailyDeadline === 0;
      
      if (currentUser.lastSessionDate !== todayStr || isMissing) {
        // Only grant a 4-hour window if it is a brand new day natively, or if the user is 100% brand new.
        // If they expire (00:00:00), they legitimately stay expired until the next day!
        const newDeadline = Date.now() + 4 * 60 * 60 * 1000;
        store.dispatch(setDailyDeadline({ dateStr: todayStr, deadline: newDeadline }));
      }
      // Otherwise, we do nothing! Natively parallel running time handles everything flawlessly!
    }, 150);
  }, [activeSlug]); // evaluates securely relying solely on profile mount

  // ── Badge unlock watcher ────────────────────────────────────────────────
  const completedScenarios = useSelector((state: RootState) => state.simulation.completedScenarios) || [];
  const completedFraudCases = useSelector((state: RootState) => state.simulation.completedFraudCases) || [];
  const savings = useSelector((state: RootState) => state.simulation.jars?.savings) || 0;
  const userLevel = useSelector((state: RootState) => state.user.level) || 1;
  const userStreak = useSelector((state: RootState) => state.user.streak) || 0;
  const dailyMissionsCompleted = useSelector((state: RootState) => state.user.dailyMissionsCompleted) || [];
  const dailyDeadline = useSelector((state: RootState) => state.user.dailyDeadline) ?? 0;

  useEffect(() => {
    if (!activeSlug) return;
    if (completedScenarios.length >= 1) dispatch(unlockBadge('first_quest'));
    if (completedFraudCases.length >= 5) dispatch(unlockBadge('scam_buster'));
    if (savings >= 5000)                 dispatch(unlockBadge('saver'));
    if (userStreak >= 3)                 dispatch(unlockBadge('streak_3'));
    if (userStreak >= 7)                 dispatch(unlockBadge('streak_7'));
    if (userLevel >= 5)                  dispatch(unlockBadge('level_5'));
    // daily_hero: all 4 missions done on time
    const isOnTime = dailyDeadline > 0 && Date.now() < dailyDeadline;
    if (dailyMissionsCompleted.length >= 4 && isOnTime) dispatch(unlockBadge('daily_hero'));
  }, [completedScenarios, completedFraudCases, savings, userStreak, userLevel, dailyMissionsCompleted, activeSlug]);

  // Run once on mount/onboarding to avoid infinite loops with state updates
  useEffect(() => {
    if (!activeSlug) return;

    const lastDate = new Date(sim.lastActiveDate || Date.now());
    const today = new Date();

    // Check if it's a new day or if active content is empty (e.g. first time user logs in)
    const isNewDay = lastDate.toDateString() !== today.toDateString();
    const needsContent = !sim.activeScams || sim.activeScams.length === 0 || !sim.activeScenarios || sim.activeScenarios.length === 0;

    if (isNewDay || needsContent) {
      // Daily generation: 5 new dynamic cases based on current level!
      const curLevel = store.getState().user.level;
      const newScams = generateDynamicFraudCases(curLevel, 5);
      const newScenarios = generateDynamicScenarios(curLevel, 5);
      dispatch(setActiveContent({ scams: newScams, scenarios: newScenarios }));
      dispatch(setLastActiveDate(Date.now()));

      // Jar health decay check on new day
      dispatch(decayJarHealth());

      // Check if any jar needs rescue
      const currentJarHealth = store.getState().engagement?.jarHealth;
      if (currentJarHealth) {
        const jarTypes: Array<'household' | 'children' | 'savings' | 'emergency'> = ['household', 'children', 'savings', 'emergency'];
        const criticalJars = jarTypes.filter(jarType => currentJarHealth[jarType]?.health < 25);

        if (criticalJars.length > 0) {
          // Show rescue modal for first critical jar
          setCriticalJar(criticalJars[0]);
          setJarRescueVisible(true);
        }
      }
    }

    // Trigger end of month if it's the calendar end of month AND we haven't shown it yet
    const lastReportDate = new Date(sim.lastMonthReportShown || 0);
    const hasShownThisMonth = lastReportDate.getMonth() === today.getMonth() &&
                              lastReportDate.getFullYear() === today.getFullYear();

    if (isEndOfMonth() && !hasShownThisMonth) {
      setShowMonthEnd(true);
    }
  // guide included: when guides switch, switchGuide clears activeScams/Scenarios → needsContent=true
  // → this effect regenerates fresh content for the incoming guide automatically.
  }, [hasOnboarded, guide]);

  // ── Tree growth watcher ──────────────────────────────────────────────────
  const fortuneTree = useSelector((state: RootState) => state.engagement?.fortuneTree);
  const prevTreeTier = useRef(fortuneTree?.treeTier || 0);

  useEffect(() => {
    if (!hasOnboarded || fortuneTree?.treeTier === undefined) return;

    if (fortuneTree.treeTier > prevTreeTier.current) {
      // Tree tier increased! Show celebration modal
      setNewTreeTier(fortuneTree.treeTier);
      setShowTreeGrowth(true);
    }
    prevTreeTier.current = fortuneTree.treeTier;
  }, [fortuneTree?.treeTier, hasOnboarded]);

  // ── Determine which root screen to show ───────────────────────────────────
  //
  // Priority order:
  //   1. No active slug → Login
  //   2. Active slug but !hasOnboarded → Onboarding (new player first time)
  //   3. Active slug + hasOnboarded → Main app

  const showLogin = activeSlug === null;
  // Existing players (isExistingPlayer=true) skip Onboarding unconditionally
  // — do not rely on hasOnboarded from Redux which may not have rehydrated yet.
  // New players (isExistingPlayer=false) need Onboarding if not yet completed.
  const showOnboarding = !showLogin && isExistingPlayer !== true && !hasOnboarded;
  const showApp        = !showLogin && !showOnboarding;

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showLogin ? (
          // ── Login / Profile picker ─────────────────────────────────────
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                onSelectProfile={async (slug) => {
                  // Existing player — mark so routing never shows Onboarding
                  const np = await switchUserProfile(slug);
                  onLogin(np, slug);
                }}
                onNewUser={async (name) => {
                  const slug = nameToSlug(name);
                  onSetPendingName(name);
                  const np = await switchUserProfile(slug);
                  onNewUserLogin(np, slug);  // ← new user handler → shows Onboarding
                }}
              />
            )}
          </Stack.Screen>
        ) : showOnboarding ? (
          // ── Onboarding (new player) ────────────────────────────────────
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={() => {}}
                // Pre-fill name if we got it from LoginScreen new-user flow
                prefillName={pendingNewName ?? undefined}
              />
            )}
          </Stack.Screen>
        ) : (
          // ── Main app ──────────────────────────────────────────────────
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="ScenarioDetail"
              component={ScenarioDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="InsightsDashboard"
              component={InsightsDashboardScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Story"
              component={StoryScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>

      {/* Global Modals */}
      <MonthEndReportModal
        visible={showMonthEnd}
        onDismiss={() => setShowMonthEnd(false)}
      />

      {/* Jar Rescue Modal */}
      {criticalJar && (
        <JarRescueModal
          visible={jarRescueVisible}
          jarName={criticalJar}
          guide={guide}
          onClose={() => {
            setJarRescueVisible(false);
            setCriticalJar(null);
          }}
        />
      )}

      {/* Tree Growth Modal */}
      {newTreeTier !== null && (
        <TreeGrowthModal
          visible={showTreeGrowth}
          newTier={newTreeTier}
          onDismiss={() => {
            setShowTreeGrowth(false);
            setNewTreeTier(null);
          }}
        />
      )}
    </>
  );
}

// ─── Storage version gate ─────────────────────────────────────────────────────
// Bump this string any time we need to wipe corrupted local storage.
// The app checks once on first launch; if the saved version differs it clears
// everything and stores the new version, giving all players a clean slate.
const STORAGE_VERSION = 'v6'; // ← bumped: clear storage for clean test run
const VERSION_KEY    = 'sakhi-storage-version';

async function runStorageMigration(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(VERSION_KEY);
    if (saved !== STORAGE_VERSION) {
      await AsyncStorage.clear();                          // wipe corrupted data
      await AsyncStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
  } catch {
    // Storage unavailable — proceed anyway
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSlug, setActiveSlug]           = useState<string | null>(null);
  const [pendingNewName, setPendingNewName]    = useState<string | null>(null);
  const [activePersistor, setActivePersistor] = useState<Persistor>(persistor);
  const [gateKey, setGateKey]                 = useState(0);
  const [storageReady, setStorageReady]       = useState(false);
  // true  = selected existing player → skip Onboarding
  // false = brand new player → must Onboard
  // null  = no one logged in yet
  const [isExistingPlayer, setIsExistingPlayer] = useState<boolean | null>(null);

  useEffect(() => {
    runStorageMigration().finally(() => setStorageReady(true));
  }, []);

  // Called when an EXISTING player is chosen from the list
  const handleSelectExisting = useCallback(async (newPersistor: Persistor, slug: string) => {
    setIsExistingPlayer(true);
    setActivePersistor(newPersistor);
    setActiveSlug(slug);
    setGateKey(k => k + 1);
  }, []);
  // Called when a BRAND NEW player types their name and hits Go
  const handleNewUser = useCallback(async (newPersistor: Persistor, slug: string) => {
    setIsExistingPlayer(false);
    setActivePersistor(newPersistor);
    setActiveSlug(slug);
    setGateKey(k => k + 1);
  }, []);
  const handleSetPendingName = useCallback((name: string) => {
    setPendingNewName(name);
  }, []);

  const handleLogout = useCallback(async () => {
    const newPersistor = await switchUserProfile(null);
    setIsExistingPlayer(null);
    setActivePersistor(newPersistor);
    setActiveSlug(null);
    setPendingNewName(null);
    setGateKey(k => k + 1);
  }, []);

  if (!storageReady) return null;

  return (
    <Provider store={store}>
      <PersistGate key={gateKey} loading={null} persistor={activePersistor}>
        <SessionContext.Provider value={{ onLogout: handleLogout }}>
          <NavigationContainer ref={navigationRef}>
            <AppNavigatorWithStatusBar
              activeSlug={activeSlug}
              onLogin={handleSelectExisting}
              onNewUserLogin={handleNewUser}
              onLogout={handleLogout}
              pendingNewName={pendingNewName}
              onSetPendingName={handleSetPendingName}
              isExistingPlayer={isExistingPlayer}
            />
          </NavigationContainer>
        </SessionContext.Provider>
      </PersistGate>
    </Provider>
  );
}

function AppNavigatorWithStatusBar(props: AppNavigatorProps) {
  const theme = useTheme();
  return (
    <>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <AppNavigator {...props} />
    </>
  );
}
