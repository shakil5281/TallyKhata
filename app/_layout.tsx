import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import '../global.css'; // nativewind styles

export default function Layout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
