import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getStyles } from '@/constants/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

// Type for a pending friend request
type Request = {
  userId: string;     // The sender of the request
  friendId: string;   // The logged-in user
  status: string;
};

export default function AddFriendScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);

  // State hooks for form input and data loading
  const [friendId, setFriendId] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the current userId and pending requests from backend
  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      setUserId(id);

      try {
        const res = await axios.get('https://4jthf6ywfh.execute-api.us-east-2.amazonaws.com/default/getPendingRequests', {
          params: { userId: id },
        });
        setRequests(res.data || []);
      } catch (err) {
        Alert.alert('Error', 'Could not load pending requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sends a friend request to the backend Lambda API
  const sendRequest = async () => {
    if (!userId || !friendId) return;

    try {
      const res = await axios.post('https://zvaltp5t2a.execute-api.us-east-2.amazonaws.com/default/addFriendRequest', {
        userId,
        friendId,
      });
      Alert.alert('Success', res.data.message);
      setFriendId(''); // Reset the input field after sending
    } catch (err) {
      Alert.alert('Error', 'Could not send request');
    }
  };

  // Accepts a pending friend request
  const acceptRequest = async (senderId: string) => {
    if (!userId) return;

    try {
      await axios.post('https://r98a6nkia7.execute-api.us-east-2.amazonaws.com/default/acceptFriendRequest', {
        userId,
        friendId: senderId,
      });

      // Remove the accepted request from local state
      setRequests(prev => prev.filter(r => r.userId !== senderId));
      Alert.alert('Accepted', `You're now friends with ${senderId}`);
    } catch (err) {
      Alert.alert('Error', 'Could not accept request');
    }
  };

  // Renders each individual pending request with an Accept button
  const renderRequest = ({ item }: { item: Request }) => (
    <View style={styles.card}>
      <Text style={styles.label}>👤 {item.userId} sent you a request</Text>
      <TouchableOpacity style={styles.button} onPress={() => acceptRequest(item.userId)}>
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Add Friend Section */}
      <Text style={styles.title}>Add a Friend</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter friend's user ID"
        value={friendId}
        onChangeText={setFriendId}
      />
      <TouchableOpacity style={styles.button} onPress={sendRequest}>
        <Text style={styles.buttonText}>Send Friend Request</Text>
      </TouchableOpacity>

      {/* Pending Requests Section */}
      <Text style={styles.title}>Pending Requests</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007BFF" />
      ) : requests.length === 0 ? (
        <Text style={{ color: '#aaa', textAlign: 'center' }}>No pending requests</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => `${item.userId}_${item.friendId}`}
          renderItem={renderRequest}
        />
      )}
    </SafeAreaView>
  );
}