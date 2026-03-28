import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';

interface MarketEventBannerProps {
  eventTitle: string;
  eventIcon: string;
  description: string;
  hoursRemaining: number;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const MarketEventBanner: React.FC<MarketEventBannerProps> = ({
  eventTitle,
  eventIcon,
  description,
  hoursRemaining,
  onPress,
}) => {
  const slideInAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide in animation
    Animated.timing(slideInAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Pulse animation for urgency when < 6 hours
    if (hoursRemaining < 6) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [hoursRemaining]);

  const urgencyColor = hoursRemaining < 6 ? '#E74C3C' : '#F39C12';
  const urgencyBg = hoursRemaining < 6 ? '#E74C3C15' : '#F39C1215';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideInAnim }, { scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: urgencyBg, borderColor: urgencyColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>{eventIcon}</Text>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: urgencyColor }]} numberOfLines={1}>
                {eventTitle}
              </Text>
              <Text style={styles.description} numberOfLines={1}>
                {description}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={[styles.timerBadge, { backgroundColor: urgencyColor }]}>
              <Feather name="clock" size={12} color="#fff" />
              <Text style={styles.timerText}>
                {hoursRemaining}h left
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={urgencyColor} />
          </View>
        </View>

        {/* Accent bar on the left */}
        <View style={[styles.accentBar, { backgroundColor: urgencyColor }]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  banner: {
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});
