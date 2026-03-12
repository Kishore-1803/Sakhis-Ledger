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
    green: '#2ECC71',
    teal: '#1ABC9C',
    blue: '#3498DB',
    purple: '#9B59B6',
    dark: '#1A1A2E',
    darker: '#16213E',
    card: '#0F3460',
  },
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F8F9FA',
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
