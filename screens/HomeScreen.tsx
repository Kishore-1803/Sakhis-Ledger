import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { applyLifeEvent, dismissLifeEvent } from '../store/simulationSlice';
import { addXP, incrementStreak } from '../store/userSlice';
import TopHeader from '../components/TopHeader';
import JarCard from '../components/JarCard';
import LifeEventModal from '../components/LifeEventModal';
import { triggerRandomLifeEvent, LifeEvent } from '../engine/lifeEvents';
import { Colors } from '../constants/theme';
import { AudioEngine } from '../utils/audioEngine';
import { TranslatedText } from '../components/TranslatedText';
import { t, LanguageCode } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const sim = useSelector((state: RootState) => state.simulation);
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode);

  const [lifeEvent, setLifeEvent] = useState<LifeEvent | null>(null);
  const [showEvent, setShowEvent] = useState(false);

  const handleTriggerEvent = () => {
    const event = triggerRandomLifeEvent(true);
    if (event) {
      setLifeEvent(event);
      setShowEvent(true);
      dispatch(
        applyLifeEvent({
          jar: event.impact.jar,
          amount: event.impact.amount,
          eventId: event.id,
        })
      );
    }
  };

  const playAudioHelp = () => {
    // If completeTasks is missing, we use a fallback that will be read by text-to-speech
    const textToRead = t('dailyMissions', lang) + '. ' + (lang === 'en' ? 'Complete tasks to earn XP.' : 'பணிகளை முடித்து XP பெறுங்கள்.');
    AudioEngine.play(textToRead, lang);
  };

  const jarData = [
    { name: 'household', amount: sim.jars.household, icon: 'home', goal: 6000 },
    { name: 'children', amount: sim.jars.children, icon: 'smile', goal: 3000 },
    { name: 'savings', amount: sim.jars.savings, icon: 'briefcase', goal: 5000 },
    { name: 'emergency', amount: sim.jars.emergency, icon: 'shield', goal: 4000 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gamified Header */}
      <TopHeader />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Today's Missions Section */}
        <View style={styles.sectionHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Feather name="crosshair" size={24} color={Colors.sakhi.darker} style={{marginRight: 8}} />
            <TranslatedText style={styles.sectionTitle}>dailyMissions</TranslatedText>
          </View>
          <TouchableOpacity onPress={playAudioHelp}>
            <Feather name="volume-2" size={24} color={Colors.sakhi.darker} />
          </TouchableOpacity>
        </View>

        <View style={styles.missionsCard}>
          <MissionRow 
            icon="book" 
            title="complete1Lesson" 
            xp="+50" 
            flame="+25"
            onPress={() => navigation.navigate('Quests')} 
            btnText="go"
          />
          <MissionRow 
            icon="shield" 
            title="defeatAScam" 
            xp="+100" 
            flame="+50"
            onPress={() => navigation.navigate('Arena')} 
            btnText="go"
          />
          <MissionRow 
            icon="briefcase" 
            title="addToSavingsJar" 
            xp="+30" 
            flame="+15"
            onPress={() => navigation.navigate('Jars')} 
            btnText="go"
          />
          <MissionRow 
            icon="alert-circle" 
            title="faceALifeEvent" 
            xp="+20" 
            flame="+10"
            onPress={handleTriggerEvent} 
            btnText="go"
          />
        </View>

        {/* Jars Overview */}
        <View style={[styles.sectionHeader, { marginTop: 24, marginBottom: 16 }]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Feather name="box" size={24} color={Colors.sakhi.darker} style={{marginRight: 8}} />
            <TranslatedText style={styles.sectionTitle}>yourJars</TranslatedText>
          </View>
        </View>
        <View style={styles.jarsGrid}>
          {jarData.map((jar) => (
            <JarCard
              key={jar.name}
              name={jar.name}
              amount={jar.amount}
              icon={jar.icon}
              goal={jar.goal}
              onPress={() => navigation.navigate('Jars')}
              isVectorIcon={true}
            />
          ))}
        </View>

      </ScrollView>

      <LifeEventModal
        event={lifeEvent}
        visible={showEvent}
        onDismiss={() => {
          setShowEvent(false);
          dispatch(dismissLifeEvent());
        }}
      />
    </View>
  );
}

function MissionRow({ icon, title, xp, flame, onPress, btnText = 'GO' }: any) {
  return (
    <View style={styles.missionRow}>
      <View style={styles.missionLeft}>
        <Feather name={icon as any} size={20} color={Colors.neutral.darkGray} style={{marginRight: 12}} />
        <View style={{ flex: 1, paddingRight: 8 }}>
          <TranslatedText style={styles.missionTitle}>{title}</TranslatedText>
        </View>
      </View>
      <View style={styles.missionRewards}>
        <Text style={styles.rewardTextXP}>{xp}</Text>
        <Text style={styles.rewardTextFlame}>{flame}</Text>
        <MaterialCommunityIcons name="fire" size={16} color={Colors.sakhi.gold} style={{marginRight: 12, marginLeft: -8}} />
        <TouchableOpacity style={styles.goBtn} onPress={onPress}>
          <TranslatedText style={styles.goBtnText}>{btnText}</TranslatedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.offWhite,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.sakhi.darker,
  },
  audioIcon: {
    fontSize: 24,
  },
  missionsCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  missionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  missionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.darkGray,
  },
  missionRewards: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardTextXP: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.sakhi.green,
    marginRight: 8,
  },
  rewardTextFlame: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.sakhi.gold,
    marginRight: 12,
  },
  goBtn: {
    backgroundColor: Colors.sakhi.green,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  goBtnText: {
    color: Colors.neutral.white,
    fontWeight: '800',
    fontSize: 12,
  },
  jarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
