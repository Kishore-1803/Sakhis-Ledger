import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Colors } from '../constants/theme';
import LanguageSettingsModal from './LanguageSettingsModal';
import { t, LanguageCode } from '../utils/i18n';
import TranslatedText from './TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function TopHeader() {
  const { name, avatar, xp, level, streak, trophies, language } = useSelector((state: RootState) => state.user);
  const [showSettings, setShowSettings] = React.useState(false);
  const lang = language as string;

  const today = new Date();
  const dateString = today.toLocaleDateString(lang === 'en' ? 'en-IN' : lang, {
    weekday: 'short', 
    day: 'numeric', 
    month: 'short'
  });

  // Simple leveling logic: Every 1000 XP is a new level.
  const currentLevelBaseXP = (level - 1) * 1000;
  const nextLevelXP = level * 1000;
  const currentLevelProgress = xp - currentLevelBaseXP;
  const progressPercent = Math.min(100, (currentLevelProgress / 1000) * 100);

  return (
    <View style={styles.container}>
      {/* Top Row: Title & Icons */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name='flower' size={24} color={Colors.neutral.white} style={{marginRight: 6}} /><Text style={styles.logoText}>{t('sakhisLedger', lang as any)}</Text></View>
        </View>
        <View style={styles.rightIcons}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateText} numberOfLines={1} adjustsFontSizeToFit>{dateString}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
            <Feather name='settings' size={18} color={Colors.neutral.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Level Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.levelBadge}>
          <View style={{flexDirection:'row', alignItems:'center'}}><Feather name='star' size={12} color={Colors.neutral.black} style={{marginRight:4}} /><Text style={styles.levelBadgeText}>Lv.{level}</Text></View>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp}/{nextLevelXP} XP</Text>
      </View>

      {/* Bottom Row: Profile & Stats */}
      <View style={styles.bottomRow}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Feather name='user' size={24} color={Colors.sakhi.darker} />
          </View>
          <View>
            <Text style={styles.nameText}>{name || 'Sakhi'}</Text>
            <Text style={styles.titleSubText}>{t('financialWarrior', lang)}</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name='fire' size={16} color={Colors.sakhi.gold} style={{marginRight:4}}/><Text style={styles.statText}>{streak}</Text></View>
          </View>
          <View style={styles.statItem}>
            <View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name='trophy' size={16} color={Colors.sakhi.gold} style={{marginRight:4}}/><Text style={styles.statText}>{trophies}</Text></View>
          </View>
        </View>
      </View>

      <LanguageSettingsModal 
        visible={showSettings} 
        onDismiss={() => setShowSettings(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.sakhi.green, // Match the green app header from mockup
    paddingTop: 50, // For status bar safe area
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.neutral.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  progressSection: {
    marginBottom: 20,
  },
  levelBadge: {
    backgroundColor: Colors.sakhi.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    position: 'absolute',
    left: 0,
    zIndex: 2,
    top: -4,
  },
  levelBadgeText: {
    color: Colors.neutral.black,
    fontWeight: '800',
    fontSize: 12,
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 12,
    borderRadius: 6,
    width: '85%',
    marginLeft: 'auto', // Push past the level badge
    overflow: 'hidden',
  },
  progressBarFill: {
    backgroundColor: Colors.sakhi.gold,
    height: '100%',
    borderRadius: 6,
  },
  xpText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: Colors.neutral.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.sakhi.gold,
  },
  avatar: {
    fontSize: 22,
  },
  nameText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
  },
  titleSubText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
