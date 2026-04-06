import "./global.css";
import { RavenProvider } from '@raven-os/core';
import { useRavenSync, RavenWelcome, RavenLoader } from '@raven-os/ui';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function App() {
  const [theme, setTheme] = useRavenSync('theme', 'dark');

  return (
    <RavenProvider loader={<RavenLoader />}>
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
        <StatusBar style={theme === 'dark' ? "light" : "dark"} />
        <RavenWelcome />
      </View>
    </RavenProvider>
  );
}
