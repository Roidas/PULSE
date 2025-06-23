import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';

export default function SettingsScreen() {
  // Toggles visibility of the preferences form
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference state values
  const [friendId, setFriendId] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [minHR, setMinHR] = useState('');
  const [maxStress, setMaxStress] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [countdown, setCountdown] = useState('');

  // Theme and navigation hooks
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);

  // Sends preferences to AWS Lambda via API Gateway
  const handleSave = async () => {
    try {
      const response = await axios.post(
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
      Alert.alert('Success', 'Preferences saved successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save preferences.');
    }
  };

  // Clears stored user ID and navigates back to login screen
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId'); // Clears local auth token
    router.replace('/(auth)/login'); // Redirects user to login screen
  };

  // Rendered layout with SafeArea + ScrollView to handle keyboard & notch space
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Page Title */}
        <Text style={styles.title}>Settings</Text>

        {/* Button to show/hide the Edit Preferences section */}
        <TouchableOpacity onPress={() => setShowPreferences(!showPreferences)} style={styles.button}>
          <Text style={styles.buttonText}>
            {showPreferences ? 'Hide Preferences' : 'Edit Preferences'}
          </Text>
        </TouchableOpacity>

        {/* Preferences Form (conditionally shown) */}
        {showPreferences && (
          <>
            <TextInput
              placeholder="Friend ID"
              value={friendId}
              onChangeText={setFriendId}
              style={styles.input}
            />
            <TextInput
              placeholder="Max Heart Rate"
              value={maxHR}
              onChangeText={setMaxHR}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Min Heart Rate"
              value={minHR}
              onChangeText={setMinHR}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Max Stress Level"
              value={maxStress}
              onChangeText={setMaxStress}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Max Distance Apart"
              value={maxDistance}
              onChangeText={setMaxDistance}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Countdown Before Notify (sec)"
              value={countdown}
              onChangeText={setCountdown}
              style={styles.input}
              keyboardType="numeric"
            />

            {/* Save button inside the preferences form */}
            <Button title="Save Preferences" onPress={handleSave} />
          </>
        )}

        {/* Logout button at the bottom in red to indicate critical action */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.button, { marginTop: 40, backgroundColor: '#e74c3c' }]}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
