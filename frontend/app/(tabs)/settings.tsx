// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
// import axios from 'axios';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { getStyles } from '@/constants/styles';

// //Variables
// const [friendId, setFriendId] = useState('');
// const [maxHR, setMaxHR] = useState('');
// const [minHR, setMinHR] = useState('');
// const [maxStress, setMaxStress] = useState('');
// const [maxDistance, setMaxDistance] = useState('');
// const [countdown, setCountdown] = useState('');

// const colorScheme = useColorScheme();
// const styles = getStyles(colorScheme ?? 'light');

// //Save Button
// const handleSave = async () => {
//     try {
//         //Post request
//       const response = await axios.post('https://y5cvvdtgx6.execute-api.us-east-2.amazonaws.com/default/setUserPreferences', {
//         friendId,
//         maxHeartRate: maxHR ? parseInt(maxHR) : undefined,
//         minHeartRate: minHR ? parseInt(minHR) : undefined,
//         maxStressLevel: maxStress ? parseInt(maxStress) : undefined,
//         maxDistanceApart: maxDistance ? parseInt(maxDistance) : undefined,
//         countdownBeforeNotify: countdown ? parseInt(countdown) : undefined,
//       });
  
//       Alert.alert('Success', response.data.message);
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Failed to save preferences.');
//     }
//   };

//   <ScrollView contentContainerStyle={{ padding: 20 }}>
//   <Text style={{ fontSize: 24, marginBottom: 10 }}>Edit Preferences</Text>

//   <TextInput placeholder="Friend ID" value={friendId} onChangeText={setFriendId} style={styles.input} />
//   ...
//   <Button title="Save Preferences" onPress={handleSave} />
// </ScrollView>

  