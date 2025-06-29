import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getStyles } from '@/constants/styles';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TouchableOpacity } from 'react-native';

import MapView, { Marker } from 'react-native-maps';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? 'light');

  // State for vitals, distance, location, user info
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  // Friend location state for friend marker
  const [friendLatitude, setFriendLatitude] = useState<number | null>(null);
  const [friendLongitude, setFriendLongitude] = useState<number | null>(null);

  const mapRef = useRef<MapView | null>(null);

  // Utility: Format ISO timestamp using local timezone (rounded to hour + minute)
  const formatUpdateTime = (isoString: string) => {
    if (!isoString) return 'just now';

    const updatedDate = new Date(isoString);

    // Check if date is invalid
    if (isNaN(updatedDate.getTime())) {
      console.warn('⚠️ Invalid date received:', isoString);
      return 'just now';
    }

    const now = new Date();
    const diffMs = now.getTime() - updatedDate.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) {
      return 'just now';
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(updatedDate);
  };

  // Reload userId and selectedFriend from AsyncStorage every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        const id = await AsyncStorage.getItem('userId');
        const friend = await AsyncStorage.getItem('selectedFriend');
        console.log('📦 Loaded from AsyncStorage:', { id, friend });

        if (!id) {
          console.warn('❌ No userId found in storage');
          return;
        }

        setUserId(id);
        setSelectedFriend(friend && friend !== id ? friend : null);
      };

      loadUserData();
    }, [])
  );

  // Fetch user vitals, GPS and trigger full location update chain every 60s
  useEffect(() => {
    const updateStatusAndLocation = async () => {
      if (!userId) return;

      // 1. Fetch heart rate and stress level
      try {
        console.log("📡 Calling getUserStatus with:", userId);
        const statusResponse = await axios.get(
          'https://eo8mje0kkf.execute-api.us-east-2.amazonaws.com/default/getUserStatus',
          { params: { friendId: userId } }
        );
        console.log("✅ getUserStatus response:", statusResponse.data);

        const { heartRate, stressLevel, updatedAt } = statusResponse.data;
        setHeartRate(heartRate);
        setStressLevel(stressLevel);
        setLastUpdated(updatedAt || new Date().toISOString());
      } catch (statusError: any) {
        console.error('❌ Error calling getUserStatus:', statusError.response?.data || statusError.message);
      }

      // 2. Get fresh location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ Location permission not granted');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLatitude(latitude);
      setLongitude(longitude);

      // 3. Fetch updated distance from friend
      let actualDistance = 0;
      if (userId && selectedFriend && selectedFriend !== userId) {
        try {
          const response = await axios.get(
            'https://il4ddhep71.execute-api.us-east-2.amazonaws.com/default/getDistanceBetweenFriends',
            {
              params: {
                friendId1: userId,
                friendId2: selectedFriend,
              },
            }
          );
          console.log("✅ getDistanceBetweenFriends response:", response.data);

          actualDistance = response.data.distance;
          setDistance(actualDistance);

          // Option B: Fetch friend's coordinates separately
          const friendResponse = await axios.get(
            'https://eo8mje0kkf.execute-api.us-east-2.amazonaws.com/default/getUserStatus',
            { params: { friendId: selectedFriend } }
          );
          const { latitude: fLat, longitude: fLng } = friendResponse.data;
          setFriendLatitude(fLat);
          setFriendLongitude(fLng);
        } catch (error: any) {
          console.error('❌ Error calling getDistanceBetweenFriends or fetching friend location:', error.response?.data || error.message);
          setDistance(null);
        }
      } else {
        setDistance(null);
      }

      // 4. Send GPS + actual distance to DynamoDB via Lambda
      try {
        console.log("📤 Sending updated location to DynamoDB...");
        await axios.post(
          'https://2nrsyr6ln7.execute-api.us-east-2.amazonaws.com/default/processFriendData',
          {
            friendId: userId,
            latitude,
            longitude,
            distanceFromFriends: actualDistance,
            sos: false
          }
        );
        console.log("✅ GPS update sent successfully");
      } catch (uploadError: any) {
        console.error('❌ Failed to update GPS to DynamoDB:', uploadError.response?.data || uploadError.message);
      }
    };

    updateStatusAndLocation();
    const interval = setInterval(updateStatusAndLocation, 60000);
    return () => clearInterval(interval);
  }, [userId, selectedFriend]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
        {userId && (
          <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
            User ID: {userId}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.statusBlock}>
        <ThemedText type="subtitle">User Status</ThemedText>

        {/* Heart rate */}
        {heartRate !== null && (
          <ThemedText>❤️ Heart Rate: {heartRate} bpm</ThemedText>
        )}

        {/* Stress level */}
        {stressLevel !== null && (
          <ThemedText>😰 Stress Level: {stressLevel}%</ThemedText>
        )}

        {/* Distance logic */}
        {(() => {
          if (!selectedFriend) {
            return (
              <ThemedText style={{ fontStyle: 'italic', opacity: 0.6 }}>
                👥 Select a friend to begin tracking distance
              </ThemedText>
            );
          }

          if (distance === null) {
            return (
              <ThemedText style={{ fontStyle: 'italic', opacity: 0.6 }}>
                📍 Unable to calculate distance from {selectedFriend}
              </ThemedText>
            );
          }

          return (
            <ThemedText>
              📍 {selectedFriend} is {distance.toFixed(1)}m away
            </ThemedText>
          );
        })()}

        {/* GPS Location */}
        {latitude !== null && longitude !== null && (
          <ThemedText>
            📡 GPS: {Math.abs(latitude).toFixed(5)}° {latitude >= 0 ? 'N' : 'S'},
            {' '}
            {Math.abs(longitude).toFixed(5)}° {longitude >= 0 ? 'E' : 'W'}
          </ThemedText>
        )}

        {/* Last update */}
        <ThemedText>🕒 Updated: {formatUpdateTime(lastUpdated)}</ThemedText>

        {/* SOS Button */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={async () => {
            try {
              console.log('🆘 SOS button pressed');
              await axios.post('https://2nrsyr6ln7.execute-api.us-east-2.amazonaws.com/default/processFriendData', {
                friendId: userId,
                latitude,
                longitude,
                distanceFromFriends: distance ?? 0,
                sos: true,
              });
              alert('🚨 SOS alert sent!');
            } catch (error) {
              console.error('❌ Failed to send SOS alert:', error);
              alert('Failed to send SOS alert.');
            }
          }}
        >
          <ThemedText style={styles.sosText}>S.O.S</ThemedText>
        </TouchableOpacity>

        {/* Mini Map */}
        {latitude && longitude && (
          <MapView
            ref={mapRef}
            style={{
              width: '100%',
              height: 200,
              marginTop: 16,
              borderRadius: 12,
            }}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onMapReady={() => {
              if (friendLatitude && friendLongitude && latitude && longitude) {
                mapRef.current?.fitToCoordinates(
                  [
                    { latitude, longitude },
                    { latitude: friendLatitude, longitude: friendLongitude },
                  ],
                  {
                    edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
                    animated: true,
                  }
                );
              }
            }}
            showsUserLocation={true}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              title="You"
              pinColor="blue"
            />

            {friendLatitude && friendLongitude && (
              <Marker
                coordinate={{ latitude: friendLatitude, longitude: friendLongitude }}
                title={selectedFriend ?? "Friend"}
                pinColor="red"
              />
            )}
          </MapView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}
