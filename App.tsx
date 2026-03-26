import React, { useEffect, useRef, useState } from 'react';
import { View, StatusBar } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store, persistor, RootState } from './store/store';
import { setLastActiveDate, setActiveContent } from './store/simulationSlice';
import { setDailyDeadline, unlockBadge } from './store/userSlice';
import { isEndOfMonth } from './engine/simulationEngine';
import { generateDynamicFraudCases, generateDynamicScenarios } from './engine/contentGenerator';
import { useTheme } from './utils/useTheme';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TranslatedText from './components/TranslatedText';

// A ref to the NavigationContainer so we can imperatively reset navigation on logout
const navigationRef = createNavigationContainerRef();

import HomeScreen from './screens/HomeScreen';
import ScenariosScreen from './screens/ScenariosScreen';
import JarsScreen from './screens/JarsScreen';
import ScamBusterScreen from './screens/ScamBusterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ScenarioDetailScreen from './screens/ScenarioDetailScreen';
import MonthEndReportModal from './components/MonthEndReportModal';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

function TabIcon({ name, focused }: { name: any; focused: boolean }) {
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
      <Feather name={name} size={focused ? 24 : 20} color={focused ? theme.tabActive : theme.tabInactive} />
    </View>
  );
}

function AppNavigator() {
  const dispatch = useDispatch();
  const hasOnboarded = useSelector((state: RootState) => state.user.hasOnboarded);
  const sim = useSelector((state: RootState) => state.simulation);
  
  const [showMonthEnd, setShowMonthEnd] = useState(false);
  // Track previous value so we only react when it actually flips to false
  const prevHasOnboarded = useRef(hasOnboarded);

  const handleOnboardingComplete = () => {};

  // ── Logout navigation: when hasOnboarded flips false, hard-reset the stack ──
  useEffect(() => {
    if (prevHasOnboarded.current === true && !hasOnboarded) {
      // State has changed from logged-in → logged-out.
      // Imperatively reset the navigation stack to Onboarding.
      if (navigationRef.isReady()) {
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          })
        );
      }
    }
    prevHasOnboarded.current = hasOnboarded;
  }, [hasOnboarded]);

  // ── Daily session window init ───────────────────────────────────────────────
  const lastSessionDate = useSelector((state: RootState) => state.user.lastSessionDate);
  useEffect(() => {
    if (!hasOnboarded) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastSessionDate !== todayStr) {
      // New day: set a 4-hour window from now
      const deadline = Date.now() + 4 * 60 * 60 * 1000;
      dispatch(setDailyDeadline({ dateStr: todayStr, deadline }));
    }
  }, [hasOnboarded]); // Only check once per mount

  // ── Badge unlock watcher ────────────────────────────────────────────────
<<<<<<< HEAD
  const completedScenarios = useSelector((state: RootState) => state.simulation.completedScenarios) || [];
  const completedFraudCases = useSelector((state: RootState) => state.simulation.completedFraudCases) || [];
  const savings = useSelector((state: RootState) => state.simulation.jars?.savings) || 0;
  const userLevel = useSelector((state: RootState) => state.user.level) || 1;
  const userStreak = useSelector((state: RootState) => state.user.streak) || 0;
  const dailyMissionsCompleted = useSelector((state: RootState) => state.user.dailyMissionsCompleted) || [];
  const dailyDeadline = useSelector((state: RootState) => state.user.dailyDeadline) ?? 0;
=======
  const completedScenarios = useSelector((state: RootState) => state.simulation.completedScenarios);
  const completedFraudCases = useSelector((state: RootState) => state.simulation.completedFraudCases);
  const savings = useSelector((state: RootState) => state.simulation.jars.savings);
  const userLevel = useSelector((state: RootState) => state.user.level);
  const userStreak = useSelector((state: RootState) => state.user.streak);
  const dailyMissionsCompleted: string[] = useSelector((state: RootState) => state.user.dailyMissionsCompleted ?? []);
  const dailyDeadline = useSelector((state: RootState) => state.user.dailyDeadline ?? 0);
>>>>>>> e48d964ba9ba5e748b2879f1ce53b780e13d3702

  useEffect(() => {
    if (!hasOnboarded) return;
    if (completedScenarios.length >= 1) dispatch(unlockBadge('first_quest'));
    if (completedFraudCases.length >= 5) dispatch(unlockBadge('scam_buster'));
    if (savings >= 5000)                 dispatch(unlockBadge('saver'));
    if (userStreak >= 3)                 dispatch(unlockBadge('streak_3'));
    if (userStreak >= 7)                 dispatch(unlockBadge('streak_7'));
    if (userLevel >= 5)                  dispatch(unlockBadge('level_5'));
    // daily_hero: all 4 missions done on time
    const isOnTime = dailyDeadline > 0 && Date.now() < dailyDeadline;
    if (dailyMissionsCompleted.length >= 4 && isOnTime) dispatch(unlockBadge('daily_hero'));
  }, [completedScenarios, completedFraudCases, savings, userStreak, userLevel, dailyMissionsCompleted]);

  // Run once on mount/onboarding to avoid infinite loops with state updates
  useEffect(() => {
    if (!hasOnboarded) return;
    
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
    }

    // Trigger end of month if it's the calendar end of month AND we haven't shown it yet
    if (isEndOfMonth() && sim.lastMonthReportShown < sim.month) {
      setShowMonthEnd(true);
    }
  }, [hasOnboarded]); // Run once on mount/onboarding to avoid infinite loops

  return (
    <>
      <Stack.Navigator key={hasOnboarded ? 'app' : 'auth'} screenOptions={{ headerShown: false }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="ScenarioDetail"
              component={ScenarioDetailScreen}
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
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationRef}>
          <AppNavigatorWithStatusBar />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

function AppNavigatorWithStatusBar() {
  const theme = useTheme();
  return (
    <>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.bg} />
      <AppNavigator />
    </>
  );
}
