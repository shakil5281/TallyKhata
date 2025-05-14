// app/_layout.js (or wherever your Layout.tsx lives)
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import '../global.css';

import { lightTheme, darkTheme } from '~/theme/theme';

export default function Layout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <PaperProvider theme={isDark ? darkTheme : lightTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
