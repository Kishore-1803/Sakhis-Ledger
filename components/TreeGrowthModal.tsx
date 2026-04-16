import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LevelUpExplosion } from './animations/LevelUpExplosion';
import { t, LanguageCode, TranslationKey } from '../utils/i18n';

// Map tier number to branch name translation key
const BRANCH_NAME_KEYS: Record<number, TranslationKey> = {
  3: 'branchProtection',
  5: 'branchEducation',
  7: 'branchBusiness',
  10: 'branchProsperity',
};

interface TreeGrowthModalProps {
  visible: boolean;
  newTier: number;
  lang?: string;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

const BRANCH_EMOJIS: Record<number, string> = {
  3: '🛡️',
  5: '📚',
  7: '🌱',
  10: '🌳',
};

export const TreeGrowthModal: React.FC<TreeGrowthModalProps> = ({
  visible,
  newTier,
  lang = 'en',
  onDismiss,
}) => {
  const l = lang as LanguageCode;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showExplosion, setShowExplosion] = React.useState(false);

  useEffect(() => {
    if (visible) {
      setShowExplosion(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
      setShowExplosion(false);
    }
  }, [visible]);

  const branchEmoji  = BRANCH_EMOJIS[newTier as keyof typeof BRANCH_EMOJIS] || '🌳';
  const branchNameKey = BRANCH_NAME_KEYS[newTier];

  return (
    <Modal visible={visible} transparent animationType="fade">
      {showExplosion && (
        <LevelUpExplosion
          visible={showExplosion}
          key={`explosion-${newTier}`}
          onComplete={() => setShowExplosion(false)}
        />
      )}

      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Celebration Text */}
          <Text style={styles.celebrationText}>🎉</Text>

          {/* Title */}
          <Text style={styles.title}>{t('fortuneTreeGrew', l)}</Text>

          {/* Tier Info */}
          <View style={styles.tierContainer}>
            <Text style={styles.tierEmoji}>🌳</Text>
            <Text style={styles.tierNumber}>Tier {newTier + 1}</Text>
          </View>

          {/* Branch Info */}
          {[3, 5, 7, 10].includes(newTier) && branchNameKey && (
            <View style={styles.branchInfo}>
              <Text style={styles.branchIcon}>{branchEmoji}</Text>
              <Text style={styles.branchLabel}>{t('newBranchUnlocked', l)}</Text>
              <Text style={styles.branchName}>{t(branchNameKey, l)}</Text>
            </View>
          )}

          {/* Message */}
          <Text style={styles.message}>{t('treeGrowthMsg', l)}</Text>

          {/* Achievement Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tier</Text>
              <Text style={styles.statValue}>+1</Text>
            </View>
            <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: 'rgba(0,0,0,0.1)' }]}>
              <Text style={styles.statLabel}>Progress</Text>
              <Text style={styles.statValue}>🌿📈</Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{t('seeMyTree', l)}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  celebrationText: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ECC71',
    textAlign: 'center',
    marginBottom: 16,
  },
  tierContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tierEmoji: {
    fontSize: 48,
  },
  tierNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  branchInfo: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  branchIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  branchLabel: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '600',
    marginBottom: 4,
  },
  branchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ECC71',
  },
  button: {
    backgroundColor: '#2ECC71',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
