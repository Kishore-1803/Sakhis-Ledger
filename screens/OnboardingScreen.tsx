import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { setUserName, setLanguage, setGuide, completeOnboarding } from '../store/userSlice';
import { Colors } from '../constants/theme';
import { AudioEngine } from '../utils/audioEngine';
import Feather from '@expo/vector-icons/Feather';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', subLabel: 'Hindi' },
  { code: 'en', label: 'English', subLabel: 'English' },
  { code: 'ta', label: 'தமிழ்', subLabel: 'Tamil' },
  { code: 'ml', label: 'മലയാളം', subLabel: 'Malayalam' },
];

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

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  
  // Form State
  const [lang, setLang] = useState('en');
  const [guide, setGuideSelection] = useState<'savitri'|'shanti'>('savitri');
  const [name, setName] = useState('');

  const STEPS_CONFIG = [
    { id: 'language', title: 'Choose Your Language' },
    { id: 'audio', title: 'Turn On Audio Guidance' },
    { id: 'guide', title: 'Choose Your Guide' },
    { id: 'name', title: 'What is your name?' },
  ];

  const currentStepId = STEPS_CONFIG[step].id;
  const isLastStep = step === STEPS_CONFIG.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (name.trim()) {
        dispatch(setLanguage(lang));
        dispatch(setGuide(guide));
        dispatch(setUserName(name.trim()));
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
          <Feather name="book-open" size={24} color={Colors.neutral.white} style={{marginRight: 8}} />
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
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
              <Feather name="globe" size={24} color={Colors.sakhi.darker} style={{marginRight: 8}} />
              <Text style={styles.cardTitle}>Choose Your Language</Text>
            </View>
            <View style={styles.langGrid}>
              {LANGUAGES.map(l => (
                <TouchableOpacity 
                  key={l.code} 
                  style={[styles.langBtn, lang === l.code && styles.langBtnActive]}
                  onPress={() => setLang(l.code)}
                >
                  <Text style={[styles.langLabel, lang === l.code && {color: Colors.sakhi.green}]}>{l.label}</Text>
                  <Text style={styles.langSub}>{l.subLabel}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    backgroundColor: Colors.sakhi.green,
  },
  topSection: {
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  mainTitle: {
    color: Colors.neutral.white,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subTitle: {
    color: Colors.sakhi.gold,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 30,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: Colors.sakhi.gold,
  },
  dotDone: {
    backgroundColor: Colors.neutral.white,
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
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  langBtn: {
    width: '48%',
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
  },
  langBtnActive: {
    borderColor: Colors.sakhi.green,
    backgroundColor: Colors.sakhi.green + '10',
  },
  langLabel: {
    fontSize: 18,
    fontWeight: '800',
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
    color: '#D97706',
    fontWeight: '500',
    lineHeight: 20,
  },
  testAudioBtn: {
    backgroundColor: Colors.sakhi.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  testAudioText: {
    color: Colors.neutral.darkGray,
    fontWeight: '800',
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
    borderColor: Colors.sakhi.gold,
    backgroundColor: Colors.sakhi.gold + '10',
  },
  guideAvatarBox: {
    backgroundColor: Colors.neutral.white,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  guideRole: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 12,
    textAlign: 'center',
  },
  guideBoostBox: {
    backgroundColor: Colors.sakhi.gold + '25',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    width: '100%',
  },
  guideBoostText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 14,
    padding: 18,
    fontSize: 20,
    color: Colors.neutral.black,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
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
    backgroundColor: Colors.sakhi.green,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginLeft: 'auto',
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
