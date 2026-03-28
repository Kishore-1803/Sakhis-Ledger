import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useTheme } from '../utils/useTheme';
import TranslatedText from '../components/TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import { AudioEngine } from '../utils/audioEngine';
import { t, LanguageCode } from '../utils/i18n';

const { width, height } = Dimensions.get('window');

const TREE_TIERS = [0, 100, 250, 500, 1000, 1800, 3000, 5000, 8000, 12000];

const TREE_BRANCHES = {
  3: {
    name: 'Protection Branch',
    icon: '🛡️',
    description: 'Emergency fund - your safety net',
    content: 'At level 3, you understand the importance of keeping ₹1000 for emergencies. This protects you from sudden expenses.',
  },
  5: {
    name: 'Education Branch',
    icon: '📚',
    description: 'Investment in future learning',
    content: 'Level 5 sakhis invest in education. Whether for yourself or children, knowledge is the best wealth.',
  },
  7: {
    name: 'Business Branch',
    icon: '🌱',
    description: 'Growing your own ventures',
    content: 'At level 7, many sakhis start small businesses. Use your savings wisely to build something lasting.',
  },
  10: {
    name: 'Prosperity Branch',
    icon: '🌳',
    description: 'A tree for the whole village',
    content: 'You\'ve reached the pinnacle! Share your knowledge with others and help your entire SHG prosper.',
  },
};

export default function FortuneTreeScreen() {
  const theme = useTheme();
  const fortuneTree = useSelector((state: RootState) => state.engagement?.fortuneTree);
  const user = useSelector((state: RootState) => state.user);
  const simulation = useSelector((state: RootState) => state.simulation);
  const lang = user.language as LanguageCode;

  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Calculate growth points
  const totalJars = Object.values(simulation?.jars || {}).reduce((a, b) => (a + Number(b)) || 0, 0);
  const currentGrowthPoints = (totalJars * 0.1) + ((user?.level || 1) * 5) + ((simulation?.jars?.savings || 0) / 1000);
  const currentTier = fortuneTree?.treeTier || 0;
  const nextThreshold = TREE_TIERS[Math.min(currentTier + 1, TREE_TIERS.length - 1)] || TREE_TIERS[TREE_TIERS.length - 1];

  // Sway animation for tree
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const renderTreeVisual = () => {
    const tiers = currentTier;
    let treeEmoji = '🌱'; // Sapling

    if (tiers >= 1) treeEmoji = '🌿';
    if (tiers >= 2) treeEmoji = '🌲';
    if (tiers >= 3) treeEmoji = '🌳';
    if (tiers >= 5) treeEmoji = '🌴';
    if (tiers >= 7) treeEmoji = '🌲';
    if (tiers >= 9) treeEmoji = '✨🌳✨';

    return (
      <Animated.View style={[styles.treeContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.treeEmoji}>{treeEmoji}</Text>
      </Animated.View>
    );
  };

  const playAudioHelp = () => {
    const text = 'Welcome to the Fortune Tree. Your wealth grows like a tree. Allocate money to jars every day, complete scenarios to earn XP, and reach higher levels to boost growth.';
    AudioEngine.play(text, lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TranslatedText style={[styles.title, { color: theme.text }]}>
            Fortune Tree
          </TranslatedText>
          <TouchableOpacity onPress={playAudioHelp} style={{ padding: 8 }}>
            <Feather name="volume-2" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <TranslatedText style={[styles.subtitle, { color: theme.textSub }]}>
          Your wealth grows like a tree 🌱
        </TranslatedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tree Visual */}
        <View style={[styles.visualContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {renderTreeVisual()}
          <TranslatedText style={[styles.tierText, { color: theme.text }]}>
            {`Tier ${currentTier + 1} of ${TREE_TIERS.length}`}
          </TranslatedText>
        </View>

        {/* Growth Progress */}
        <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
          <View style={styles.progressHeader}>
            <TranslatedText style={[styles.progressLabel, { color: theme.text }]}>
              Growth Progress
            </TranslatedText>
            <Text style={[styles.progressValue, { color: '#2ECC71' }]}>
              {Math.floor(currentGrowthPoints)} / {nextThreshold}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min((currentGrowthPoints / nextThreshold) * 100, 100)}%`,
                  backgroundColor: '#2ECC71',
                },
              ]}
            />
          </View>
          <TranslatedText style={[styles.progressHint, { color: theme.textSub }]}>
            {`${Math.ceil(nextThreshold - currentGrowthPoints)} points to next level`}
          </TranslatedText>
        </View>

        {/* Unlocked Branches */}
        <View style={styles.branchesContainer}>
          <TranslatedText style={[styles.branchesTitle, { color: theme.text }]}>
            🌿 Your Branches
          </TranslatedText>

          {[3, 5, 7, 10].map((tier) => {
            const isUnlocked = currentTier >= tier;
            const branch = TREE_BRANCHES[tier as keyof typeof TREE_BRANCHES];

            return (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.branchCard,
                  {
                    backgroundColor: isUnlocked ? theme.card : theme.card + '80',
                    borderColor: isUnlocked ? '#2ECC71' : theme.border,
                  },
                ]}
                onPress={() => setSelectedBranch(isUnlocked ? tier : null)}
                disabled={!isUnlocked}
              >
                <View style={styles.branchContent}>
                  <View style={styles.branchLeft}>
                    <Text style={styles.branchIcon}>{branch.icon}</Text>
                    <View>
                      <TranslatedText style={[styles.branchName, { color: theme.text }]}>
                        {branch.name}
                      </TranslatedText>
                      <TranslatedText style={[styles.branchTier, { color: theme.textSub }]}>
                        {`Unlocks at Tier ${tier}`}
                      </TranslatedText>
                    </View>
                  </View>
                  {isUnlocked && (
                    <Feather name="chevron-right" size={24} color="#2ECC71" />
                  )}
                  {!isUnlocked && (
                    <Text style={styles.lockIcon}>🔒</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tier Milestones */}
        <View style={styles.milestonesContainer}>
          <TranslatedText style={[styles.milestonesTitle, { color: theme.text }]}>
            📊 Your Progress
          </TranslatedText>
          <View style={styles.milestonesGrid}>
            {TREE_TIERS.map((_, idx) => {
              const isReached = currentTier > idx;
              const isCurrent = currentTier === idx;

              return (
                <View
                  key={idx}
                  style={[
                    styles.milestoneDot,
                    {
                      backgroundColor: isCurrent
                        ? '#FFD700'
                        : isReached
                        ? '#2ECC71'
                        : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.milestoneText}>{idx + 1}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' }]}>
          <TranslatedText style={styles.tipsTitle}>💡 Growth Tips</TranslatedText>
          <TranslatedText style={styles.tipsText}>
            {`• Allocate money to jars every day\n• Complete scenarios to earn XP\n• Reach higher levels to boost growth\n• Every ₹100 saved adds growth points`}
          </TranslatedText>
        </View>
      </ScrollView>

      {/* Branch Detail Modal */}
      {selectedBranch && TREE_BRANCHES[selectedBranch as keyof typeof TREE_BRANCHES] && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedBranch(null)}
            >
              <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={styles.modalEmoji}>
              {TREE_BRANCHES[selectedBranch as keyof typeof TREE_BRANCHES].icon}
            </Text>
            <TranslatedText style={[styles.modalTitle, { color: theme.text }]}>
              {TREE_BRANCHES[selectedBranch as keyof typeof TREE_BRANCHES].name}
            </TranslatedText>
            <TranslatedText style={[styles.modalContent2, { color: theme.textSub }]}>
              {TREE_BRANCHES[selectedBranch as keyof typeof TREE_BRANCHES].content}
            </TranslatedText>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedBranch(null)}
            >
              <TranslatedText style={styles.modalCloseBtnText}>Got it!</TranslatedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 204, 113, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
  },
  treeContainer: {
    alignItems: 'center',
  },
  treeEmoji: {
    fontSize: 120,
  },
  tierText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  branchesContainer: {
    marginBottom: 16,
  },
  branchesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  branchCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
  },
  branchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  branchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  branchTier: {
    fontSize: 12,
    fontWeight: '500',
  },
  lockIcon: {
    fontSize: 20,
  },
  milestonesContainer: {
    marginBottom: 16,
  },
  milestonesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  milestoneDot: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  tipsCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalContent2: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalCloseBtn: {
    backgroundColor: '#2ECC71',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 8,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
