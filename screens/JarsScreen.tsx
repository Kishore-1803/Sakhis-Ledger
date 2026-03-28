import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { allocateToJar, removeFromJar, advanceMonth } from '../store/simulationSlice';
import { addXP, completeDailyMission } from '../store/userSlice';
import { healJar } from '../store/engagementSlice';
import JarCard from '../components/JarCard';
import GlobalHeader from '../components/GlobalHeader';
import { Colors, MONTHLY_INCOME } from '../constants/theme';
import { useTheme } from '../utils/useTheme';
import { JarState } from '../engine/simulationEngine';
import { TranslatedText } from '../components/TranslatedText';
import { t, LanguageCode } from '../utils/i18n';
import Feather from '@expo/vector-icons/Feather';

export default function JarsScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const sim = useSelector((state: RootState) => state.simulation);
  const lang = useSelector((state: RootState) => state.user.language as LanguageCode);
  const { dailyMissionsCompleted, dailyDeadline } = useSelector((state: RootState) => state.user);
  const theme = useTheme();
  const [selectedJar, setSelectedJar] = useState<keyof JarState | null>(null);
  const [amount, setAmount] = useState('');

  const totalInJars = sim.jars.household + sim.jars.children + sim.jars.savings + sim.jars.emergency;

  const handleAllocate = () => {
    if (!selectedJar || !amount) return;
    const value = parseInt(amount, 10);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }
    if (value > sim.balance) {
      Alert.alert('Insufficient Balance', `You only have ₹${sim.balance.toLocaleString('en-IN')} available.`);
      return;
    }
    dispatch(allocateToJar({ jar: selectedJar, amount: value }));

    // Heal jar health when allocating
    dispatch(healJar({ jar: selectedJar, amount: value }));

    setAmount('');
    dispatch(addXP(5)); // XP for each allocation

    // Mark 'jars' daily mission done on first allocation today
    if (!(dailyMissionsCompleted ?? []).includes('jars')) {
      const isOnTime = (dailyDeadline ?? 0) > 0 && Date.now() < (dailyDeadline ?? 0);
      const jarsBonus = isOnTime ? 30 : Math.floor(30 * 0.3);
      dispatch(addXP(jarsBonus));
      dispatch(completeDailyMission('jars'));
    }
  };

  const handleRemove = () => {
    if (!selectedJar || !amount) return;
    const value = parseInt(amount, 10);
    if (isNaN(value) || value <= 0) return;
    
    const currentJarAmount = sim.jars[selectedJar] || 0;
    if (value > currentJarAmount) {
      Alert.alert('Insufficient Funds', `This jar only has ₹${currentJarAmount.toLocaleString('en-IN')}.`);
      return;
    }
    dispatch(removeFromJar({ jar: selectedJar, amount: value }));
    setAmount('');
  };

  const jarNames: (keyof JarState)[] = ['household', 'children', 'savings', 'emergency'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <GlobalHeader title={t('yourJars', lang)} audioText={t('yourJars', lang)} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Balance bar */}
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <TranslatedText style={styles.balanceLabel}>availableToAllocate</TranslatedText>
          <Text style={styles.balanceAmount}>₹{sim.balance.toLocaleString('en-IN')}</Text>
        </View>

        {/* Jars grid */}
        <View style={styles.jarsGrid}>
          {jarNames.map((jarKey) => (
            <JarCard
              key={jarKey}
              name={jarKey}
              amount={sim.jars[jarKey]}
              icon={
                jarKey === 'household' ? 'home' :
                jarKey === 'children' ? 'smile' :
                jarKey === 'savings' ? 'briefcase' : 'shield'
              }
              goal={
                jarKey === 'household' ? 6000 :
                jarKey === 'children' ? 3000 :
                jarKey === 'savings' ? 5000 : 4000
              }
              onPress={() => setSelectedJar(jarKey)}
              isVectorIcon={true}
            />
          ))}
        </View>

        {/* Allocation Controls */}
        {selectedJar && (
          <View style={[styles.actionCard, { backgroundColor: theme.card }]}>
            <View style={styles.actionHeader}>
               <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1}}>
                 <TranslatedText style={styles.actionTitle}>allocateTo</TranslatedText>
                 <Text style={styles.actionTitle}> </Text>
                 <TranslatedText style={styles.actionTitle}>{selectedJar}</TranslatedText>
               </View>
               <TouchableOpacity style={styles.closeActionBtn} onPress={() => setSelectedJar(null)}>
                 <Feather name="x" size={24} color={Colors.neutral.darkGray} />
               </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder={t('enterAmount', lang) || 'Enter Amount'}
              placeholderTextColor={theme.textSub}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.quickAmounts}>
              {[500, 1000, 2000, 3000].map((q) => (
                <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => setAmount(String(q))}>
                  <Text style={styles.quickText}>₹{q.toLocaleString('en-IN')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.addBtn, !amount && {opacity: 0.5}]} 
                onPress={handleAllocate}
                disabled={!amount}
              >
                <TranslatedText style={styles.btnText}>add</TranslatedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.removeBtn, !amount && {opacity: 0.5}]} 
                onPress={handleRemove}
                disabled={!amount}
              >
                <TranslatedText style={styles.btnText}>remove</TranslatedText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.sakhi.goldDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 13,
    color: Colors.sakhi.goldDark,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.sakhi.goldLight,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  jarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  jarWrapper: {
    width: '47%',
    marginBottom: 0,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  actionCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '40',
    borderTopWidth: 3,
    borderTopColor: Colors.sakhi.goldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.sakhi.goldDark,
  },
  closeActionBtn: {
    padding: 4,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.sakhi.goldLight + '20',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '50',
  },
  quickText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.sakhi.goldDark,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: Colors.sakhi.green,
    borderBottomWidth: 4,
    borderBottomColor: Colors.sakhi.greenDark,
  },
  removeBtn: {
    backgroundColor: Colors.sakhi.coral,
    borderBottomWidth: 4,
    borderBottomColor: '#CC4444',
  },
  btnText: {
    color: Colors.neutral.white,
    fontWeight: '900',
    fontSize: 15,
  },
});
