import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, StatusBar, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setUserName, setLanguage, setGuide, completeOnboarding } from '../store/userSlice';
import { Colors } from '../constants/theme';
import { AudioEngine } from '../utils/audioEngine';
import { LANGUAGES } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';

interface OnboardingScreenProps {
  onComplete: () => void;
  prefillName?: string;
}

const GUIDES = [
  { 
    id: 'savitri', 
    name: 'Savitri Didi', 
    role: 'Earning Woman', 
    avatar: 'user',
    stats: { budget: 4, saving: 5, defense: 4, boostText: '+10% XP on savings lessons' }
  },
  { 
    id: 'shanti', 
    name: 'Shanti Didi', 
    role: 'Household CFO', 
    avatar: 'users',
    stats: { budget: 5, saving: 4, defense: 5, boostText: '+10% XP on budgeting quests' }
  },
];

export default function OnboardingScreen({ onComplete, prefillName }: OnboardingScreenProps) {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  
  // Form State
  const [lang, setLang] = useState('en');
  const [guide, setGuideSelection] = useState<'savitri'|'shanti'>('savitri');
  const [name, setName] = useState(prefillName ?? '');

  // If name was already provided from Login screen, skip that step
  const STEPS_CONFIG = prefillName
    ? [
        { id: 'language', title: 'Choose Your Language' },
        { id: 'audio', title: 'Turn On Audio Guidance' },
        { id: 'guide', title: 'Choose Your Guide' },
      ]
    : [
        { id: 'language', title: 'Choose Your Language' },
        { id: 'audio', title: 'Turn On Audio Guidance' },
        { id: 'guide', title: 'Choose Your Guide' },
        { id: 'name', title: 'What is your name?' },
      ];

  const currentStepId = STEPS_CONFIG[step].id;
  const isLastStep = step === STEPS_CONFIG.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Use prefillName if available, otherwise require the name field
      const finalName = prefillName?.trim() || name.trim();
      if (finalName) {
        dispatch(setLanguage(lang));
        dispatch(setGuide(guide));
        dispatch(setUserName(finalName));
        dispatch(completeOnboarding());
        onComplete();
      }
    } else {
      setStep(step + 1);
    }
  };

  const playTestAudio = () => {
    AudioEngine.play('Audio guidance is now active. Let the journey begin!', lang);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Intro Header */}
      <View style={styles.topSection}>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Feather name="book-open" size={26} color={Colors.sakhi.goldLight} style={{marginRight: 8}} />
          <Text style={styles.mainTitle}>Sakhis' Ledger</Text>
        </View>
        <Text style={styles.subTitle}>Your Financial Adventure Awaits!</Text>
        
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {STEPS_CONFIG.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]}
            >
               {i < step && <Feather name="check" color="#fff" size={10} />}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.contentSection}>
        
        {/* Step 1: Language */}
        {currentStepId === 'language' && (
          <View style={[styles.card, { flex: 1, paddingBottom: 0 }]}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <Feather name="globe" size={24} color={Colors.sakhi.darker} style={{marginRight: 8}} />
              <Text style={styles.cardTitle}>Choose Your Language</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <View style={styles.langGrid}>
                {LANGUAGES.map(l => (
                  <TouchableOpacity 
                    key={l.code} 
                    style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                    onPress={() => setLang(l.code)}
                  >
                    <Text style={[styles.langLabel, lang === l.code && {color: Colors.sakhi.goldDark}]}>{l.label}</Text>
                    <Text style={styles.langSub}>{l.subLabel}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Step 2: Audio */}
        {currentStepId === 'audio' && (
          <View style={[styles.card, {borderColor: Colors.sakhi.gold, backgroundColor: Colors.sakhi.gold + '10'}]}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={playTestAudio}>
                <Feather name="volume-2" size={48} color={Colors.sakhi.darker} style={{marginRight: 16}} />
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <Text style={[styles.cardTitle, {color: '#D97706', marginBottom: 4}]}>Audio Guidance Available</Text>
                <Text style={styles.audioHint}>Tap the speaker icon anytime to hear instructions!</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.testAudioBtn} onPress={playTestAudio}>
               <Text style={styles.testAudioText}>Test Audio</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Guide */}
        {currentStepId === 'guide' && (
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <Feather name="smile" size={24} color={Colors.sakhi.darker} style={{marginRight: 8}} />
              <Text style={styles.cardTitle}>Choose Your Guide</Text>
            </View>
            <View style={styles.guideRow}>
              {GUIDES.map(g => (
                <TouchableOpacity 
                  key={g.id} 
                  style={[styles.guideBtn, guide === g.id && styles.guideBtnActive]}
                  onPress={() => setGuideSelection(g.id as any)}
                >
                  <View style={styles.guideAvatarBox}>
                    <Feather name={g.avatar as any} size={40} color={guide === g.id ? Colors.sakhi.green : Colors.neutral.darkGray} />
                  </View>
                  <Text style={styles.guideName}>{g.name}</Text>
                  <Text style={styles.guideRole}>{g.role}</Text>
                  <View style={styles.guideBoostBox}>
                    <Text style={styles.guideBoostText}>{g.stats.boostText}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Name */}
        {currentStepId === 'name' && (
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <Feather name="star" size={24} color={Colors.sakhi.darker} style={{marginRight: 8}} />
              <Text style={styles.cardTitle}>What should we call you?</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.neutral.gray}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        )}
        
      </View>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, isLastStep && !name.trim() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={isLastStep && !name.trim()}
        >
          <Text style={styles.nextText}>{isLastStep ? "Let's Begin!" : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#218C53',
  },
  topSection: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  mainTitle: {
    color: Colors.sakhi.goldLight,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subTitle: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 30,
    opacity: 0.9,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
    transform: [{ rotate: '45deg' }],
  },
  dotActive: {
    backgroundColor: Colors.sakhi.goldLight,
    borderColor: Colors.sakhi.goldDark,
  },
  dotDone: {
    backgroundColor: Colors.neutral.white,
    borderColor: Colors.sakhi.goldLight,
  },
  contentSection: {
    flex: 1,
    backgroundColor: Colors.neutral.offWhite,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 40,
  },
  card: {
    backgroundColor: Colors.neutral.parchment,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '30',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.sakhi.darker,
    marginBottom: 20,
    textAlign: 'center',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  langBtn: {
    width: '47%',
    marginBottom: 12,
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
  },
  langBtnActive: {
    borderColor: Colors.sakhi.goldLight,
    backgroundColor: Colors.sakhi.goldLight + '15',
  },
  langLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  langSub: {
    fontSize: 12,
    color: Colors.neutral.gray,
    fontWeight: '600',
  },
  audioHint: {
    fontSize: 14,
    color: Colors.sakhi.goldDark,
    fontWeight: '600',
    lineHeight: 20,
  },
  testAudioBtn: {
    backgroundColor: Colors.sakhi.goldLight,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
    borderBottomWidth: 3,
    borderBottomColor: Colors.sakhi.goldDark,
  },
  testAudioText: {
    color: '#1A1A2E',
    fontWeight: '900',
    fontSize: 14,
  },
  guideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  guideBtn: {
    flex: 1,
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
  },
  guideBtnActive: {
    borderColor: Colors.sakhi.goldLight,
    backgroundColor: Colors.sakhi.goldLight + '10',
  },
  guideAvatarBox: {
    backgroundColor: Colors.neutral.white,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: Colors.sakhi.goldDark,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  guideRole: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  guideBoostBox: {
    backgroundColor: Colors.sakhi.goldLight + '25',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.sakhi.goldDark + '30',
  },
  guideBoostText: {
    fontSize: 10,
    color: Colors.sakhi.goldDark,
    fontWeight: '800',
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 14,
    padding: 18,
    fontSize: 20,
    color: Colors.neutral.black,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark + '40',
  },
  footer: {
    backgroundColor: Colors.neutral.offWhite,
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    padding: 14,
  },
  backText: {
    color: Colors.neutral.gray,
    fontSize: 16,
    fontWeight: '700',
  },
  nextBtn: {
    backgroundColor: Colors.sakhi.goldLight,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginLeft: 'auto',
    borderBottomWidth: 4,
    borderBottomColor: Colors.sakhi.goldDark,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '900',
  },
});
