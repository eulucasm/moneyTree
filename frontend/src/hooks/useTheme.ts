import { useColorScheme } from '../components/useColorScheme';
import Theme from '../constants/Colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const colors = Theme[colorScheme];
  return { theme: colorScheme, colors };
}
