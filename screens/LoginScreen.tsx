/**
 * LoginScreen.tsx
 *
 * Shown on every cold-start (when no active session is loaded) and after
 * logout.  Lets the user:
 *   • Pick an existing profile → resume their exact progress
 *   • Type a brand-new name   → go through Onboarding
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar, Animated, Easing, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { ProfileEntry, loadProfiles, nameToSlug } from '../store/profileRegistry';
import { Colors } from '../constants/theme';

const LOGO = require('../assets/logo.png');

interface LoginScreenProps {
  onSelectProfile: (slug: string) => void;   // existing profile chosen
  onNewUser: (name: string) => void;          // brand-new name entered
}

export default function LoginScreen({ onSelectProfile, onNewUser }: LoginScreenProps) {
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  // Subtle pulse animation for the logo
  const pulse = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const data = await loadProfiles();
    setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const handleSelectProfile = (profile: ProfileEntry) => {
    onSelectProfile(profile.slug);
  };

  const handleNewUser = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setError('');
    onNewUser(trimmed);
  };

  const timeAgo = (ts: number): string => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Hero header ── */}
      <View style={styles.hero}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Image
            source={LOGO}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.heroTitle}>Sakhis' Ledger</Text>
        <Text style={styles.heroSub}>Your Financial Adventure Awaits</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── Known profiles ── */}
        {loading ? (
          <ActivityIndicator color={Colors.sakhi.goldLight} size="large" style={{ marginVertical: 32 }} />
        ) : profiles.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="users" size={18} color={Colors.sakhi.goldLight} />
              <Text style={styles.sectionTitle}> Who's playing?</Text>
            </View>

            {profiles.map((p) => (
              <TouchableOpacity
                key={p.slug}
                style={styles.profileCard}
                onPress={() => handleSelectProfile(p)}
                activeOpacity={0.78}
              >
                <View style={styles.avatarBubble}>
                  <Text style={styles.avatarText}>{p.avatar || '👩'}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{p.name}</Text>
                  <Text style={styles.profileMeta}>Last played {timeAgo(p.lastLogin)}</Text>
                </View>
                <View style={styles.profileChevron}>
                  <Feather name="chevron-right" size={22} color={Colors.sakhi.goldLight} />
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or add new player</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.welcomeText}>
              Welcome! 🙏{'\n'}Let's set up your first profile.
            </Text>
          </View>
        )}

        {/* ── New user input ── */}
        <View style={styles.newUserCard}>
          <View style={styles.inputRow}>
            <Feather name="user-plus" size={20} color={Colors.sakhi.goldLight} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.neutral.gray}
              value={newName}
              onChangeText={(t) => { setNewName(t); setError(''); }}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleNewUser}
            />
          </View>
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.startBtn, !newName.trim() && styles.startBtnDisabled]}
            onPress={handleNewUser}
            disabled={!newName.trim()}
          >
            <Text style={styles.startBtnText}>Start New Journey</Text>
            <Feather name="arrow-right" size={18} color="#1A1A2E" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A4731',
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 14,
  },
  heroTitle: {
    color: Colors.sakhi.goldLight,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
    backgroundColor: Colors.neutral.offWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 50,
  },

  // ── Section ───────────────────────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.sakhi.darker,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: Colors.sakhi.darker,
    lineHeight: 26,
    marginVertical: 8,
  },

  // ── Profile cards ─────────────────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.parchment,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.sakhi.goldLight + '20',
    borderWidth: 2,
    borderColor: Colors.sakhi.goldLight + '60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 26,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.sakhi.darker,
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 12,
    color: Colors.neutral.gray,
    fontWeight: '600',
  },
  profileChevron: {
    paddingLeft: 8,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral.gray,
  },

  // ── New user card ─────────────────────────────────────────────────────────
  newUserCard: {
    backgroundColor: Colors.neutral.parchment,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.offWhite,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.sakhi.goldDark + '40',
    marginBottom: 14,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: Colors.neutral.black,
    paddingVertical: 12,
  },
  errorText: {
    color: Colors.feedback.danger,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.sakhi.goldLight,
    borderRadius: 16,
    paddingVertical: 15,
    borderBottomWidth: 4,
    borderBottomColor: Colors.sakhi.goldDark,
  },
  startBtnDisabled: {
    opacity: 0.45,
  },
  startBtnText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '900',
  },
});
