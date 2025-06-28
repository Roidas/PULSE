import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';

export default function SettingsScreen() {
  // Toggle for showing the preferences form
  const [showPreferences, setShowPreferences] = useState(false);

  // State for preference fields
  const [friendId, setFriendId] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [minHR, setMinHR] = useState('');
  const [maxStress, setMaxStress] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [countdown, setCountdown] = useState('');

  // Hooks for navigation and theming
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);

  // Load initial values from AsyncStorage
  useEffect(() => {
    const loadInitialValues = async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) setFriendId(userId);

      const stored = await AsyncStorage.getItem('userPreferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        setMaxHR(prefs.maxHR ?? '180');
        setMinHR(prefs.minHR ?? '60');
        setMaxStress(prefs.maxStress ?? '70');
        setMaxDistance(prefs.maxDistance ?? '250');
        setCountdown(prefs.countdown ?? '600');
      } else {
        // Default fallback values
        setMaxHR('180');
        setMinHR('60');
        setMaxStress('70');
        setMaxDistance('250');
        setCountdown('600');
      }
    };

    loadInitialValues();
  }, []);

  // Save preferences to AWS and local storage
  const handleSave = async () => {
    const newPrefs = { maxHR, minHR, maxStress, maxDistance, countdown };

    try {
      // Send to AWS Lambda
      await axios.post(
        'https://y5cvvdtgx6.execute-api.us-east-2.amazonaws.com/default/setUserPreferences',
        {
          friendId,
          maxHeartRate: maxHR ? parseInt(maxHR) : undefined,
          minHeartRate: minHR ? parseInt(minHR) : undefined,
          maxStressLevel: maxStress ? parseInt(maxStress) : undefined,
          maxDistanceApart: maxDistance ? parseInt(maxDistance) : undefined,
          countdownBeforeNotify: countdown ? parseInt(countdown) : undefined,
        }
      );

      // Save to local storage
      await AsyncStorage.setItem('userPreferences', JSON.stringify(newPrefs));
      Alert.alert('Success', 'Preferences saved successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  // Logout: clear storage and redirect
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('selectedFriend');
    router.replace('/(auth)/login');
  };

  // Render UI
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Settings</Text>

        {/* Button to toggle preferences form */}
        <TouchableOpacity onPress={() => setShowPreferences(!showPreferences)} style={styles.button}>
          <Text style={styles.buttonText}>
            {showPreferences ? 'Hide Preferences' : 'Edit Preferences'}
          </Text>
        </TouchableOpacity>

        {/* Preferences Form */}
        {showPreferences && (
          <>
            <View style={[styles.input, { justifyContent: 'center' }]}>
              <Text style={{ fontSize: 16, color: '#555' }}>
                User ID: <Text style={{ fontWeight: 'bold' }}>{friendId}</Text>
              </Text>
            </View>

            <View>
              <Text style={styles.label}>Max Heart Rate (bpm)</Text>
              <TextInput
                value={maxHR}
                onChangeText={setMaxHR}
                style={styles.input}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Min Heart Rate (bpm)</Text>
              <TextInput
                value={minHR}
                onChangeText={setMinHR}
                style={styles.input}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Max Stress Level (%)</Text>
              <TextInput
                value={maxStress}
                onChangeText={setMaxStress}
                style={styles.input}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Max Distance from Friend (meters)</Text>
              <TextInput
                value={maxDistance}
                onChangeText={setMaxDistance}
                style={styles.input}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Countdown Before Alert (seconds)</Text>
              <TextInput
                value={countdown}
                onChangeText={setCountdown}
                style={styles.input}
                keyboardType="numeric"
              />
            </View>

            <Button title="Save Preferences" onPress={handleSave} />
          </>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.button, { marginTop: 500, backgroundColor: '#e74c3c' }]}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
