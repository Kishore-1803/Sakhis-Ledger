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
import { useDispatch } from 'react-redux';
import { rescueJar } from '../store/engagementSlice';
import { addXP } from '../store/userSlice';
import TranslatedText from './TranslatedText';

interface JarRescueModalProps {
  visible: boolean;
  jarName: 'household' | 'children' | 'savings' | 'emergency';
  guide: 'savitri' | 'shanti';
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const JAR_LABELS = {
  household: 'Household Jar',
  children: 'Children Jar',
  savings: 'Savings Jar',
  emergency: 'Emergency Jar',
};

export const JarRescueModal: React.FC<JarRescueModalProps> = ({
  visible,
  jarName,
  guide,
  onClose,
}) => {
  const dispatch = useDispatch();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
    }
  }, [visible]);

  const handleRescue = () => {
    dispatch(rescueJar(jarName));
    dispatch(addXP(50)); // Bonus XP for rescue
    onClose();
  };

  const guideAvatar = guide === 'savitri' ? '👩' : '👵';
  const guideName = guide === 'savitri' ? 'Savitri Didi' : 'Shanti Didi';

  return (
    <Modal visible={visible} transparent animationType="fade">
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
          {/* Guide Avatar */}
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{guideAvatar}</Text>
          </View>

          {/* Warning Icon */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            <TranslatedText textKey="jar_rescue_title" />
          </Text>

          {/* Message */}
          <Text style={styles.jarName}>{JAR_LABELS[jarName]}</Text>
          <Text style={styles.message}>
            <TranslatedText textKey="jar_rescue_message" />
          </Text>

          <View style={styles.guideMessageContainer}>
            <Text style={styles.guideName}>{guideName} says:</Text>
            <Text style={styles.guideMessage}>
              "Just like we care for our homes, our savings jars need regular attention!
              Add some money today to keep your jar strong and healthy. 💪"
            </Text>
          </View>

          {/* Rescue Button */}
          <TouchableOpacity
            style={styles.rescueButton}
            onPress={handleRescue}
            activeOpacity={0.8}
          >
            <Text style={styles.rescueButtonText}>
              <TranslatedText textKey="jar_rescue_button" />
            </Text>
            <Text style={styles.bonusText}>+50 XP Bonus!</Text>
          </TouchableOpacity>

          {/* Remind Later */}
          <TouchableOpacity
            style={styles.laterButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.laterButtonText}>
              <TranslatedText textKey="jar_rescue_later" />
            </Text>
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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -40,
    marginTop: -60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  warningContainer: {
    marginTop: 50,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 8,
  },
  jarName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  guideMessageContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  guideName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E67E22',
    marginBottom: 8,
  },
  guideMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  rescueButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  rescueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bonusText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  laterButton: {
    paddingVertical: 10,
  },
  laterButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
