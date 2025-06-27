// Main screen showing real-time metrics
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import { useEffect, useState } from 'react';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  // Detect light/dark mode
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? 'light');

  // State: vitals and distance between friends
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // States for location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  //User ID
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch both vitals and distance every 60s
  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (id) setUserId(id);

      try {
        // 1. Fetch user vitals
        const statusResponse = await axios.get(
          'https://eo8mje0kkf.execute-api.us-east-2.amazonaws.com/default/getUserStatus'
        );

        const { heartRate, stressLevel, updatedAt } = statusResponse.data;
        setHeartRate(heartRate);
        setStressLevel(stressLevel);
        setLastUpdated(updatedAt || new Date().toLocaleTimeString());

        // 2. Fetch distance between two friends (replace with real userIds)
        const distanceResponse = await axios.get(
          'https://il4ddhep71.execute-api.us-east-2.amazonaws.com/default/getDistanceBetweenFriends',
          {
            params: {
              friendId1: 'felix', 
              friendId2: 'david',  
            },
          }
        );

        setDistance(distanceResponse.data.distance);
      } catch (error) {
        console.error('Failed to fetch user status or distance:', error);
      }
    };
    // Get users current location
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission not granted');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude);
        setLongitude(location.coords.longitude);
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchData();        // Load metrics
    fetchLocation();    // Load GPS
    const interval = setInterval(() => {
      fetchData();
      fetchLocation();
    }, 60000); // Every 60s

    return () => clearInterval(interval);
  }, []);

  // Render scrollable, themed view
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      {/* Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
        {userId && (
        <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
          User ID: {userId}
        </ThemedText>
        )}
      </ThemedView>

      {/* Status Block */}
      <ThemedView style={styles.statusBlock}>
        <ThemedText type="subtitle">User Status</ThemedText>

        {heartRate !== null && (
          <ThemedText>❤️ Heart Rate: {heartRate} bpm</ThemedText>
        )}
        {stressLevel !== null && (
          <ThemedText>😰 Stress Level: {stressLevel}%</ThemedText>
        )}
        {distance !== null && (
          <ThemedText>📍 Distance from Friend: {distance.toFixed(1)} m</ThemedText>
        )}
        {latitude !== null && longitude !== null && (
          <ThemedText>
            📡 GPS: {Math.abs(latitude).toFixed(5)}° {latitude >= 0 ? 'N' : 'S'}, {Math.abs(longitude).toFixed(5)}° {longitude >= 0 ? 'E' : 'W'}
          </ThemedText>
        )}
        <ThemedText>🕒 Last Update: {lastUpdated}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}
