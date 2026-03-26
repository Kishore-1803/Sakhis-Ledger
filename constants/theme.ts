export const Colors = {
  primary: {
    50: '#fef3e2',
    100: '#fde4b9',
    200: '#fcd58c',
    300: '#fbc55f',
    400: '#fab83d',
    500: '#f9ab1c',
    600: '#f59d18',
    700: '#ef8a13',
    800: '#e97810',
    900: '#df580a',
  },
  sakhi: {
    rose: '#E84C6F',
    coral: '#FF6B6B',
    gold: '#F9AB1C',
    goldLight: '#FFD700',
    goldDark: '#B8860B',
    bronze: '#CD7F32',
    green: '#2ECC71',
    greenDark: '#1A9B50',
    teal: '#1ABC9C',
    blue: '#3498DB',
    purple: '#9B59B6',
    dark: '#1A1A2E',
    darker: '#16213E',
    card: '#0F3460',
    navy: '#1B2838',
    darkNavy: '#0F1923',
    royalBlue: '#2C4A6E',
  },
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FDF6E3',
    parchment: '#FFFEF7',
    lightGray: '#E9ECEF',
    gray: '#ADB5BD',
    darkGray: '#495057',
    black: '#212529',
  },
  feedback: {
    success: '#2ECC71',
    warning: '#F39C12',
    danger: '#E74C3C',
    info: '#3498DB',
  },
};

export const JarColors: Record<string, string> = {
  Household: '#3498DB',
  Children: '#9B59B6',
  Savings: '#2ECC71',
  Emergency: '#E74C3C',
};

export const MONTHLY_INCOME = 15000;

export const FIN_HEALTH_LABELS: Record<string, { label: string; color: string }> = {
  poor: { label: 'Needs Work', color: '#E74C3C' },
  fair: { label: 'Getting There', color: '#F39C12' },
  good: { label: 'On Track', color: '#3498DB' },
  excellent: { label: 'Excellent!', color: '#2ECC71' },
};

export const getTheme = (isDark: boolean) => ({
  // Backgrounds — warm parchment (light) / rich navy (dark)
  bg:         isDark ? '#1B2838' : '#FDF6E3',
  card:       isDark ? '#243447' : '#FFFEF7',
  surface:    isDark ? '#2C3E50' : '#F5F0E1',
  input:      isDark ? '#1E3044' : '#FFFEF7',
  // Text
  text:       isDark ? '#E8EEF4' : '#2C3E50',
  textSub:    isDark ? '#7A8899' : '#7F8C8D',
  // Borders — gold-tinted
  border:     isDark ? '#B8860B30' : '#B8860B25',
  // Header — deep emerald green
  headerBg:   isDark ? '#1A6B3C' : '#218C53',
  // Tab bar — dark navy with gold accents
  tabBg:      isDark ? '#0F1923' : '#1B2838',
  tabBorder:  isDark ? '#FFD70030' : '#FFD70025',
  tabActive:  '#FFD700',
  tabInactive: isDark ? '#556070' : '#8899AA',
  // Status bar
  statusBar:  isDark ? 'light-content' : 'dark-content' as 'light-content' | 'dark-content',
});
