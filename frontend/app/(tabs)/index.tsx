import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? 'light');

  //MOCK DATA
  const heartRate = 162;
  const stressLevel = 72;
  const distance = 362;
  const lastUpdated = '5 minutes ago';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.statusBlock}>
        <ThemedText type="subtitle">User Status</ThemedText>
        {heartRate && <ThemedText>❤️ Heart Rate: {heartRate} bpm</ThemedText>}
        {stressLevel && <ThemedText>😰 Stress Level: {stressLevel}%</ThemedText>}
        <ThemedText>📍 Distance from Friends: {distance} m</ThemedText>
        <ThemedText>🕒 Last Update: {lastUpdated}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}


   
