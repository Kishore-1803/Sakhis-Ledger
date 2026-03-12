import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { store, persistor, RootState } from './store/store';
import { setLastActiveDate, setActiveContent } from './store/simulationSlice';
import { isEndOfMonth } from './engine/simulationEngine';
import { generateDynamicFraudCases, generateDynamicScenarios } from './engine/contentGenerator';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import TranslatedText from './components/TranslatedText';

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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f1f1',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#059669', // Colors.sakhi.green
        tabBarInactiveTintColor: '#9CA3AF', // Colors.neutral.gray
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarLabel: ({ focused, color }) => {
          let label = route.name;
          if (route.name === 'Home') label = 'Home';
          if (route.name === 'Quests') label = 'Quests';
          if (route.name === 'Jars') label = 'Jars';
          if (route.name === 'Arena') label = 'Arena';
          return <TranslatedText text={label} lang={lang} style={{ color, fontSize: 11, fontWeight: '700' }} />;
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
  return (
    <Feather name={name} size={focused ? 24 : 20} color={focused ? '#059669' : '#9CA3AF'} />
  );
}

function AppNavigator() {
  const dispatch = useDispatch();
  const hasOnboarded = useSelector((state: RootState) => state.user.hasOnboarded);
  const sim = useSelector((state: RootState) => state.simulation);
  
  const [showOnboarding, setShowOnboarding] = useState(!hasOnboarded);
  const [showMonthEnd, setShowMonthEnd] = useState(false);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  useEffect(() => {
    setShowOnboarding(!hasOnboarded);
  }, [hasOnboarded]);

  // Time-Based Progression Engine Check
  useEffect(() => {
    if (!hasOnboarded) return;
    
    const lastDate = new Date(sim.lastActiveDate || Date.now());
    const today = new Date();
    
    // Check if it's a new day or if active content is empty (e.g. first time user logs in)
    const isNewDay = lastDate.toDateString() !== today.toDateString();
    const needsContent = !sim.activeScams || sim.activeScams.length === 0 || !sim.activeScenarios || sim.activeScenarios.length === 0;

    if (isNewDay || needsContent) {
      // Daily generation: 5 new dynamic cases based on current level!
      const userLevel = store.getState().user.level;
      const newScams = generateDynamicFraudCases(userLevel, 5);
      const newScenarios = generateDynamicScenarios(userLevel, 5);
      dispatch(setActiveContent({ scams: newScams, scenarios: newScenarios }));
      dispatch(setLastActiveDate(Date.now()));
    }

    // Trigger end of month if it's the calendar end of month AND we haven't shown it yet
    if (isEndOfMonth() && sim.lastMonthReportShown < sim.month) {
      setShowMonthEnd(true);
    }
  }, [hasOnboarded]); // Run once on mount/onboarding to avoid infinite loops with state updates

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasOnboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : null}
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="ScenarioDetail"
          component={ScenarioDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
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
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}
