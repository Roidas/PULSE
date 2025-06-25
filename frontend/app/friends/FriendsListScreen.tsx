import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Type for each friend record
type Friend = {
  userId: string;
  friendId: string;
  status: string;
  addedAt?: string;
};

const FriendsListScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);      // Logged-in user ID
  const [friends, setFriends] = useState<Friend[]>([]);           // List of accepted friends
  const [loading, setLoading] = useState(true);                   // Loading state

  // Fetch user ID and friend list on component mount
  useEffect(() => {
    const loadUserAndFriends = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          setUserId(id);

          // Call Lambda to get accepted friends
          const res = await axios.get('https://ajcmjtr313.execute-api.us-east-2.amazonaws.com/default/getAcceptedFriends', {
            params: { userId: id },
          });

          setFriends(res.data); // Store in state
        }
      } catch (err) {
        console.error('Failed to fetch friends:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndFriends();
  }, []);

  // Renders each friend item in the list
  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendName}>👤 {item.friendId}</Text>
      {item.addedAt && (
        <Text style={styles.meta}>Added: {new Date(item.addedAt).toLocaleDateString()}</Text>
      )}
    </View>
  );

  // Show loading spinner
  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

  // If no friends, display fallback
  if (!friends.length) {
    return (
      <View style={styles.centered}>
        <Text>No friends yet 😢</Text>
      </View>
    );
  }

  // Main list of accepted friends
  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => `${item.userId}_${item.friendId}`}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

// Basic styles for this screen
const styles = StyleSheet.create({
  friendItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  meta: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
});

export default FriendsListScreen;
