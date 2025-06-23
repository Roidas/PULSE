import React, { use, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

const LOGIN_URL = 'https://qxlezobmjj.execute-api.us-east-2.amazonaws.com/default/loginUser'

export default function loginScreen(){
    const[email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const styles = getStyles(colorScheme);

    const handleLogin = async () => {
        if (!email || !password) {
        Alert.alert('Missing fields', 'Please enter both email and password.');
        return;
        }

        try{
            const response = await axios.post(LOGIN_URL, {email, password});

            if (response.status === 200 && response.data.userId) {
                await AsyncStorage.setItem('userId', response.data.userId);
                Alert.alert('Welcome back!', 'Login successful.');
                router.replace('/(tabs)');
              } else {
                Alert.alert('Login failed', 'Incorrect credentials.');
              }
        }catch(error){
            console.error('Login error:', error);
            Alert.alert('Error', 'Could not log in. Please try again later.');
        }
    };
    
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Login</Text>
    
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
    
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={{ color: '#007BFF', marginTop: 10, textAlign: 'center' }}>
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }