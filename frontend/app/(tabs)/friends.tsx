import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getStyles } from '@/constants/styles';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';

export default function FriendsTabScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = getStyles(colorScheme);
  const navigation = useNavigation();

  // State hooks
  const [userId, setUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user ID and fetch accepted friends
  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) return;
      setUserId(id);
      try {
        const res = await axios.get('https://ajcmjtr313.execute-api.us-east-2.amazonaws.com/default/getAcceptedFriends', {
          params: { userId: id },
        });
        // Deduplicate friends by friendId
        const uniqueMap = new Map();
        res.data.forEach((friend: any) => {
          if (!uniqueMap.has(friend.friendId)) {
            uniqueMap.set(friend.friendId, friend);
          }
        });

        setFriends(Array.from(uniqueMap.values()));
      } catch (err) {
        Alert.alert('Error', 'Failed to load friends list.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Render a friend card
   const renderFriend = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: styles.title.color }}>
        👤 {item.friendId}
      </Text>
      {item.addedAt && (
        <Text style={{ fontSize: 13, marginTop: 4, color: styles.input.borderColor }}>
          Added: {new Date(item.addedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  // Show loading spinner
  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#007BFF" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={styles.title}>Your Friends</Text>
        <TouchableOpacity onPress={() => router.push('/(friends)/AddFriendScreen')}>
          <Ionicons name="add" size={28} color={styles.title.color} />
        </TouchableOpacity>
      </View>

      {friends.length === 0 ? (
        <Text style={{ color: '#aaa', textAlign: 'center' }}>No friends yet 😢</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => `${item.userId}_${item.friendId}`}
          renderItem={renderFriend}
        />
      )}
    </SafeAreaView>
  );
}
