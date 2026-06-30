import { useThemeStore } from '../stores/useThemeStore';

export const useColorScheme = () => {
  return useThemeStore((state) => state.theme);
};
