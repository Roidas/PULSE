import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// Hook for light/dark mode styling
import { useColorScheme } from '@/hooks/useColorScheme';
// Centralized styling function
import { getStyles } from '@/constants/styles';
// For storing userId locally
import AsyncStorage from '@react-native-async-storage/async-storage';
// Router for navigation after signup
import { useRouter } from 'expo-router';
// HTTP client for API call
import axios from 'axios';

const API_URL = 'https://tog7g1gn3h.execute-api.us-east-2.amazonaws.com/default/createUser'; 

export default function SignupScreen() {
  // State hooks to manage user input
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);

  // Handles the sign-up process
  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    //Start loading
    setLoading(true);

    try {
      // Send POST request to AWS Lambda endpoint 
      const response = await axios.post(API_URL, {
        firstName,
        lastName,
        email,
        phone,
        password
      });

      // Successful
      if (response.status === 200) {
        const userId = response.data.userId;
        await AsyncStorage.setItem('userId', userId);
        Alert.alert('Success', 'User created successfully!');
        router.replace('/(tabs)'); //Switch to index.tsx
      } else {
        Alert.alert('Signup failed', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Could not sign up. Please try again later.');
    } finally {
      setLoading(false); //stop loading
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
         contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
        <TextInput
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={{ color: '#007BFF', marginTop: 10, textAlign: 'center' }}>
            Already have an account? Return to login
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
