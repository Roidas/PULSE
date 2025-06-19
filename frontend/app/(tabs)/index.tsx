//Main screen showing real-time metrics
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  //light/dark mode)
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? 'light');

  //App state: live user vitals and last update timestamp
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  //Fetch data from backend Lambda every minute
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get(
          'https://eo8mje0kkf.execute-api.us-east-2.amazonaws.com/default/getUserStatus'
        );

        // Destructure the backend response
        const { heartRate, stressLevel, distanceFromFriends, updatedAt } = response.data;

        setHeartRate(heartRate);
        setStressLevel(stressLevel);
        setDistance(distanceFromFriends);
        setLastUpdated(updatedAt || new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Failed to fetch user status:', error);
      }
    };

    //Initial and interval-based updates
    fetchUserStatus();
    const interval = setInterval(fetchUserStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  //UI layout using custom components with parallax and themed styles
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      {/* Header section with wave emoji */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Realtime user metrics */}
      <ThemedView style={styles.statusBlock}>
        <ThemedText type="subtitle">User Status</ThemedText>
        {heartRate !== null && (
          <ThemedText>❤️ Heart Rate: {heartRate} bpm</ThemedText>
        )}
        {stressLevel !== null && (
          <ThemedText>😰 Stress Level: {stressLevel}%</ThemedText>
        )}
        {distance !== null && (
          <ThemedText>📍 Distance from Friends: {distance} m</ThemedText>
        )}
        <ThemedText>🕒 Last Update: {lastUpdated}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}
