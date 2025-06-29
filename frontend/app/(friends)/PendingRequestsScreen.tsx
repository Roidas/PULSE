import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getStyles } from '@/constants/styles';

// Type for a pending friend request
type Request = {
  userId: string;     // The person who sent the request
  friendId: string;   // The current (logged-in) user receiving the request
  status: string;
  addedAt?: string;
};

const PendingRequestsScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);   // Current user's ID
  const [requests, setRequests] = useState<Request[]>([]);     // Pending friend requests
  const [loading, setLoading] = useState(true);                // Loading state while fetching data
  const colorScheme = useColorScheme() ?? 'light';             // Theme hook (light/dark mode)
  const styles = getStyles(colorScheme);                       // Theme-based styles

  // Fetch pending friend requests on component mount
  useEffect(() => {
    const fetchRequests = async () => {
      const id = await AsyncStorage.getItem('userId');         // Get logged-in user ID from local storage
      if (!id) return;
      setUserId(id);

      try {
        // Call API to get pending friend requests for this user
        const res = await axios.get(
          'https://4jthf6ywfh.execute-api.us-east-2.amazonaws.com/default/getPendingRequests',
          { params: { userId: id } }
        );
        setRequests(res.data || []); // Save result to state
      } catch (err) {
        console.error('Error fetching requests:', err);
        Alert.alert('Error', 'Could not load friend requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Accept a specific friend request
  const acceptRequest = async (senderId: string) => {
    if (!userId) return;

    try {
      // Call backend Lambda to accept the friend request
      await axios.post(
        'https://r98a6nkia7.execute-api.us-east-2.amazonaws.com/default/acceptFriendRequest',
        {
          userId,        // User accepting the request
          friendId: senderId, // Friend who originally sent the request
        }
      );

      Alert.alert('Accepted', `You're now friends with ${senderId}`);

      // Remove the accepted request from the local UI list
      setRequests(prev => prev.filter(req => req.userId !== senderId));
    } catch (err) {
      console.error('Error accepting request:', err);
      Alert.alert('Error', 'Could not accept request.');
    }
  };

  // UI for each request card
  const renderRequest = ({ item }: { item: Request }) => (
    <View
      style={{
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: 'white', fontSize: 16 }}>
        👤 {item.userId} sent you a request
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => acceptRequest(item.userId)}>
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  // Show loading spinner while fetching requests
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007BFF" />;
  }

  // Render screen content
  return (
    <View style={styles.container}>
      {/* Header Title with fixed contrast */}
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        Pending Friend Requests
      </Text>

      {/* No pending requests */}
      {requests.length === 0 ? (
        <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>
          No pending requests
        </Text>
      ) : (
        // List of all pending requests
        <FlatList
          data={requests}
          keyExtractor={(item) => `${item.userId}_${item.friendId}`}
          renderItem={renderRequest}
        />
      )}
    </View>
  );
};

export default PendingRequestsScreen;
