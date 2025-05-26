import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import ModalPopUp from './ModalPopUp';  // Import the ModalPopUp component

const LocationUploader = ({ onLocationSuccess }) => {
  const [locationData, setLocationData] = useState(null);  // This will store the server's response
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const uploadLocationWithMetadata = async () => {
      try {
        // Request location permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Allow location access to use this feature.');
          return;
        }

        // Request notification permission
        const { status: notifStatus } = await Notifications.requestPermissionsAsync();
        if (notifStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Allow notifications to register push token.');
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        const timestamp = new Date(location.timestamp).toISOString();

        // Gather device metadata
        const device_id = Constants.deviceId || 'unknown';
        const device_name = Constants.deviceName || 'Unknown Device';
        const platform = Constants.osName || 'unknown';
        const app_version = Constants.manifest?.version || '1.0.0';

        // Get push token for notifications
        const { data: expo_push_token } = await Notifications.getExpoPushTokenAsync();

        const payload = {
          latitude,
          longitude,
          timestamp,
          device_id,
          device_name,
          platform,
          app_version,
          expo_push_token: expo_push_token || 'none', // Ensure it's always defined
        };

        // Send data to server
        const response = await fetch('https://visitmyjoburg.co.za/api/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to send data');
        }

        const result = await response.json();  // This is the server response
        setLocationData(result);  // Save server response in state
        setModalVisible(true);  // Make modal visible after successful response

        // Pass data to parent component if available
        if (onLocationSuccess) {
          onLocationSuccess(result);
        }

      } catch (error) {
        console.error('Error uploading location:', error);
        Alert.alert('Error', 'An error occurred while uploading location. Please try again later.');
      }
    };

    uploadLocationWithMetadata();
  }, []); // Empty dependency array ensures this effect runs once

  return (
    <View style={{ flex: 1 }}>
      {modalVisible && <ModalPopUp locationData={locationData} onClose={() => setModalVisible(false)} />}
    </View>
  );
};

export default LocationUploader;
