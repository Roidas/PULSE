import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

// Screen component for sending a friend request using a friend's userId
const AddFriendScreen = () => {
  // State to hold the friendId input 
  const [friendId, setFriendId] = useState('');
  
  // State to store the current logged-in user's ID
  const [userId, setUserId] = useState<string | null>(null);

  // Retrieves the current user's ID from storage
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id); // Save to state once fetched
    };
    fetchUserId();
  }, []);

  // Calls backend API to send a friend request
  const sendRequest = async () => {
    // Validate input: both userId and friendId must be present
    if (!userId || !friendId) return;

    try {
      // Make POST request to Lambda API to store friend request in DynamoDB
      const res = await axios.post('https://zvaltp5t2a.execute-api.us-east-2.amazonaws.com/default/addFriendRequest', {
        userId,
        friendId,
      });

      // Show success message returned by backend
      Alert.alert('Success', res.data.message);
    } catch (err) {
      // Show error if the request fails (e.g. network or server error)
      Alert.alert('Error', 'Could not send request');
    }
  };

  return (
    <View style={styles.container}>
      {/* Text input for entering a friend's user ID */}
      <TextInput
        placeholder="Enter friend user ID"
        value={friendId}
        onChangeText={setFriendId}
        style={styles.input}
      />

      {/* Button to trigger the friend request*/}
      <Button title="Send Friend Request" onPress={sendRequest} disabled={!userId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default AddFriendScreen;
