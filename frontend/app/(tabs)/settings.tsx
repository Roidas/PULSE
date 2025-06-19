import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function SettingsScreen() {
  // Hooks
  const [friendId, setFriendId] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [minHR, setMinHR] = useState('');
  const [maxStress, setMaxStress] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [countdown, setCountdown] = useState('');

  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? 'light');

  // Save Button
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

  // JSX UI
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Edit Preferences</Text>
  
        <TextInput placeholder="Friend ID" value={friendId} onChangeText={setFriendId} style={styles.input} />
        <TextInput placeholder="Max Heart Rate" value={maxHR} onChangeText={setMaxHR} style={styles.input} keyboardType="numeric" />
        <TextInput placeholder="Min Heart Rate" value={minHR} onChangeText={setMinHR} style={styles.input} keyboardType="numeric" />
        <TextInput placeholder="Max Stress Level" value={maxStress} onChangeText={setMaxStress} style={styles.input} keyboardType="numeric" />
        <TextInput placeholder="Max Distance Apart" value={maxDistance} onChangeText={setMaxDistance} style={styles.input} keyboardType="numeric" />
        <TextInput placeholder="Countdown Before Notify (sec)" value={countdown} onChangeText={setCountdown} style={styles.input} keyboardType="numeric" />
  
        <Button
          title="Save Preferences"
          onPress={handleSave}
        />
      </ScrollView>
    </SafeAreaView>
  )};
