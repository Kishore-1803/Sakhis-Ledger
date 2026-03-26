import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getTheme } from '../constants/theme';

export const useTheme = () => {
  const isDark = useSelector((state: RootState) => state.user.isDarkMode ?? false);
  return { ...getTheme(isDark), isDark };
};
