import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  startStory,
  makeStoryChoice,
  advanceChapter,
  completeStory,
} from '../store/engagementSlice';
import { addXP } from '../store/userSlice';
import { useTheme } from '../utils/useTheme';
import TranslatedText from '../components/TranslatedText';
import Feather from '@expo/vector-icons/Feather';
import stories from '../data/sakhiStories.json';

const { width } = Dimensions.get('window');

interface Choice {
  id: string;
  text: string;
  nextChapter: string | null;
  isOptimal: boolean;
  impact: { xpReward: number; finHealth: number };
  explanation: string;
  educationalNote: string;
}

interface Chapter {
  id: string;
  title: string;
  narrative: string;
  image: string;
  choices: Choice[];
}

interface Story {
  id: string;
  title: string;
  character: string;
  theme: string;
  totalChapters: number;
  chapters: Chapter[];
}

interface StoryScreenProps {
  navigation: any;
  route: any;
}

export default function StoryScreen({ navigation, route }: StoryScreenProps) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const storyProgress = useSelector((state: RootState) => state.engagement?.stories);

  const storyId = route?.params?.storyId || storyProgress?.currentStoryId;
  const story: Story | undefined = stories.find((s) => s.id === storyId) as any;

  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (story && !storyProgress?.currentStoryId) {
      dispatch(startStory(story.id));
    }
  }, [story]);

  if (!story) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={[styles.errorText, { color: theme.text }]}>Story not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentChapter = story.chapters[currentChapterIndex];
  if (!currentChapter) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🎬</Text>
          <Text style={[styles.errorText, { color: theme.text }]}>Story ended</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleChoicePress = (choice: Choice) => {
    setSelectedChoice(choice.id);
    dispatch(makeStoryChoice({ chapterId: currentChapter.id, choiceId: choice.id }));
    dispatch(addXP(choice.impact.xpReward));
    setShowExplanation(true);
  };

  const handleContinue = () => {
    const selectedChoiceObj = currentChapter.choices.find(
      (c) => c.id === selectedChoice
    );

    if (!selectedChoiceObj) return;

    if (selectedChoiceObj.nextChapter) {
      const nextIndex = story.chapters.findIndex(
        (c) => c.id === selectedChoiceObj.nextChapter
      );

      if (nextIndex >= 0) {
        dispatch(advanceChapter(nextIndex + 1));
        setCurrentChapterIndex(nextIndex);
        setSelectedChoice(null);
        setShowExplanation(false);
      } else {
        // Story end
        dispatch(
          completeStory({
            storyId: story.id,
            endingType: selectedChoiceObj.isOptimal ? 'good' : 'bad',
          })
        );
        navigation.goBack();
      }
    } else {
      // Story complete
      dispatch(
        completeStory({
          storyId: story.id,
          endingType: selectedChoiceObj.isOptimal ? 'good' : 'bad',
        })
      );
      navigation.goBack();
    }
  };

  const progress = ((currentChapterIndex + 1) / story.totalChapters) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {story.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progress}%`,
                backgroundColor: '#2ECC71',
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.textSub }]}>
          Chapter {currentChapterIndex + 1} of {story.totalChapters}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Character Image */}
        <View style={styles.imageContainer}>
          <Text style={styles.characterImage}>{currentChapter.image}</Text>
        </View>

        {/* Chapter Title */}
        <Text style={[styles.chapterTitle, { color: theme.text }]}>
          {currentChapter.title}
        </Text>

        {/* Narrative */}
        <View style={[styles.narrativeBox, { backgroundColor: theme.card }]}>
          <Text style={[styles.narrative, { color: theme.text }]}>
            {currentChapter.narrative}
          </Text>
        </View>

        {/* Choices */}
        {!showExplanation ? (
          <View style={styles.choicesContainer}>
            <Text style={[styles.choicesLabel, { color: theme.text }]}>
              What should happen next?
            </Text>
            {currentChapter.choices.map((choice, index) => (
              <TouchableOpacity
                key={choice.id}
                style={[
                  styles.choiceButton,
                  {
                    backgroundColor:
                      selectedChoice === choice.id ? '#2ECC7150' : theme.card,
                    borderColor:
                      selectedChoice === choice.id ? '#2ECC71' : theme.border,
                  },
                ]}
                onPress={() => handleChoicePress(choice)}
                disabled={selectedChoice !== null && selectedChoice !== choice.id}
                activeOpacity={0.8}
              >
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceNumber}>{String.fromCharCode(65 + index)}</Text>
                  <Text
                    style={[styles.choiceText, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {choice.text}
                  </Text>
                  {choice.isOptimal && (
                    <Text style={styles.optimalBadge}>✨ Smart choice</Text>
                  )}
                </View>
                {selectedChoice === choice.id && (
                  <View style={styles.selectedIndicator}>
                    <Feather name="check-circle" size={20} color="#2ECC71" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.explanationContainer}>
            {/* XP Reward */}
            <View style={[styles.rewardBox, { backgroundColor: '#FFD70020' }]}>
              <Text style={styles.rewardText}>
                ⭐ +{currentChapter.choices.find((c) => c.id === selectedChoice)?.impact.xpReward || 0} XP
              </Text>
            </View>

            {/* Explanation */}
            <View style={[styles.explanationBox, { backgroundColor: theme.card }]}>
              <Text style={[styles.explanationLabel, { color: theme.textSub }]}>
                What happened:
              </Text>
              <Text style={[styles.explanationText, { color: theme.text }]}>
                {currentChapter.choices.find((c) => c.id === selectedChoice)?.explanation}
              </Text>
            </View>

            {/* Educational Note */}
            <View style={[styles.educationBox, { backgroundColor: '#E8F4F8' }]}>
              <Text style={styles.educationLabel}>💡 Remember</Text>
              <Text style={[styles.educationText, { color: '#0A3B47' }]}>
                {currentChapter.choices.find((c) => c.id === selectedChoice)?.educationalNote}
              </Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {currentChapterIndex === story.totalChapters - 1 ? 'View Ending' : 'Continue Story'}
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 12,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  characterImage: {
    fontSize: 80,
  },
  chapterTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  narrativeBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  narrative: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
  },
  choicesContainer: {
    marginBottom: 20,
  },
  choicesLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  choiceButton: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  choiceNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ECC71',
    marginRight: 10,
    minWidth: 20,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  optimalBadge: {
    fontSize: 10,
    color: '#2ECC71',
    fontWeight: '600',
    marginTop: 2,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  explanationContainer: {
    marginBottom: 20,
  },
  rewardBox: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  explanationBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  explanationText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  educationBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0A3B47',
  },
  educationLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A3B47',
    marginBottom: 6,
  },
  educationText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
