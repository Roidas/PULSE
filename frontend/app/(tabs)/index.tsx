import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? 'light');

  // State for vitals, distance, location, user info
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  // Reload userId and selectedFriend from AsyncStorage every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const id = await AsyncStorage.getItem('userId');
        const friend = await AsyncStorage.getItem('selectedFriend');
        console.log('📦 Loaded from AsyncStorage:', { id, friend });

        if (!id) {
          console.warn('❌ No userId found in storage');
          return;
        }

        setUserId(id);
        setSelectedFriend(friend && friend !== id ? friend : null);
      };

      loadUserData();
    }, [])
  );

  // Re-fetch distance from friend when either ID changes
  useEffect(() => {
    const fetchDistance = async () => {
      if (userId && selectedFriend && selectedFriend !== userId) {
        try {
          const response = await axios.get(
            'https://il4ddhep71.execute-api.us-east-2.amazonaws.com/default/getDistanceBetweenFriends',
            {
              params: {
                friendId1: userId,
                friendId2: selectedFriend,
              },
            }
          );
          console.log("✅ getDistanceBetweenFriends response:", response.data);
          setDistance(response.data.distance);
        } catch (error: any) {
          console.error('❌ Error calling getDistanceBetweenFriends:', error.response?.data || error.message);
          setDistance(null);
        }
      } else {
        setDistance(null);
      }
    };

    fetchDistance();
  }, [userId, selectedFriend]);

  // Fetch user vitals and GPS every 60 seconds
  useEffect(() => {
    const fetchStatusAndLocation = async () => {
      if (!userId) return;

      // 1. Fetch heart rate and stress level
      try {
        console.log("📡 Calling getUserStatus with:", userId);
        const statusResponse = await axios.get(
          'https://eo8mje0kkf.execute-api.us-east-2.amazonaws.com/default/getUserStatus',
          {
            params: { friendId: userId },
          }
        );
        console.log("✅ getUserStatus response:", statusResponse.data);
        const { heartRate, stressLevel, updatedAt } = statusResponse.data;

        setHeartRate(heartRate);
        setStressLevel(stressLevel);
        setLastUpdated(updatedAt || new Date().toLocaleTimeString());
      } catch (statusError: any) {
        console.error('❌ Error calling getUserStatus:', statusError.response?.data || statusError.message);
      }

      // 2. Get current device location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Location permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    };

    fetchStatusAndLocation(); // run once
    const interval = setInterval(fetchStatusAndLocation, 60000); // run every 60 sec
    return () => clearInterval(interval); // cleanup
  }, [userId]);

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
        {userId && (
          <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
            User ID: {userId}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.statusBlock}>
        <ThemedText type="subtitle">User Status</ThemedText>

        {/* Heart rate */}
        {heartRate !== null && (
          <ThemedText>❤️ Heart Rate: {heartRate} bpm</ThemedText>
        )}

        {/* Stress level */}
        {stressLevel !== null && (
          <ThemedText>😰 Stress Level: {stressLevel}%</ThemedText>
        )}

        {/* Distance logic */}
        {(() => {
          if (!selectedFriend) {
            return (
              <ThemedText style={{ fontStyle: 'italic', opacity: 0.6 }}>
                👥 Select a friend to begin tracking distance
              </ThemedText>
            );
          }

          if (distance === null) {
            return (
              <ThemedText style={{ fontStyle: 'italic', opacity: 0.6 }}>
                📍 Unable to calculate distance from {selectedFriend}
              </ThemedText>
            );
          }

          return (
            <ThemedText>
              📍 Distance from {selectedFriend}: {distance.toFixed(1)} m
            </ThemedText>
          );
        })()}

        {/* GPS Location */}
        {latitude !== null && longitude !== null && (
          <ThemedText>
            📡 GPS: {Math.abs(latitude).toFixed(5)}° {latitude >= 0 ? 'N' : 'S'},{' '}
            {Math.abs(longitude).toFixed(5)}° {longitude >= 0 ? 'E' : 'W'}
          </ThemedText>
        )}

        {/* Last update */}
        <ThemedText>🕒 Last Update: {lastUpdated}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}
