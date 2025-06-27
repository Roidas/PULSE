import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getStyles } from '@/constants/styles'; 

type Request = {
  userId: string;      // the person who sent the request
  friendId: string;    // the logged-in user
  status: string;
  addedAt?: string;
};

const PendingRequestsScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);

  // Fetch pending friend requests when component mounts
  useEffect(() => {
    const fetchRequests = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      setUserId(id);

      try {
        // Gets pending friend requests
        const res = await axios.get('https://4jthf6ywfh.execute-api.us-east-2.amazonaws.com/default/getPendingRequests', {
          params: { userId: id },
        });
        setRequests(res.data || []); // Update state
      } catch (err) {
        console.error('Error fetching requests:', err);
        Alert.alert('Error', 'Could not load friend requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Accept a pending request
  const acceptRequest = async (senderId: string) => {
    if (!userId) return;

    try {
      // Calls backend to accept friend request
      await axios.post('https://r98a6nkia7.execute-api.us-east-2.amazonaws.com/default/acceptFriendRequest', {
        userId, // User accepting request
        friendId: senderId, // Friend who sent the request
      });

      Alert.alert('Accepted', `You're now friends with ${senderId}`);
      // Remove accepted request from local state
      setRequests(prev => prev.filter(req => req.userId !== senderId));
    } catch (err) {
      console.error('Error accepting request:', err);
      Alert.alert('Error', 'Could not accept request.');
    }
  };

  const renderRequest = ({ item }: { item: Request }) => (
    <View
      style={{
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: 'white', fontSize: 16 }}>👤 {item.userId} sent you a request</Text>
      <TouchableOpacity style={styles.button} onPress={() => acceptRequest(item.userId)}>
        <Text style={styles.buttonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007BFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Friend Requests</Text>
      {requests.length === 0 ? (
        <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 40 }}>No pending requests</Text>
      ) : (
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