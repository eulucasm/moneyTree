import { useThemeStore } from '../stores/useThemeStore';
import Theme from '../theme/Colors';

export function useTheme() {
  const { theme: colorScheme, toggleTheme, setTheme } = useThemeStore();
  const colors = Theme[colorScheme];
  
  return { 
    colors, 
    colorScheme, 
    toggleTheme, 
    setTheme 
  };
}
