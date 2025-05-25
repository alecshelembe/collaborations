import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import axios from 'axios';

const notificationQuestions = [
  "New YouTube Video Uploads",
  "New Product or Merch Drops",
  "Livestream Announcements",
  "Collaborations",

];

type NotificationSetting = {
  question: string;
  push: boolean;
};

const STORAGE_KEY = 'notification_preferences';

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        } else {
          const defaultSettings = notificationQuestions.map((question) => ({
            question,
            push: false,
          }));
          setSettings(defaultSettings);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
        }
      } catch (error) {
        console.error('Failed to load notification settings', error);
      }
    };

    registerForPushNotificationsAsync().then((token) => {
      if (token) setExpoPushToken(token);
    });

    loadSettings();
  }, []);

  const togglePush = async (index: number) => {
    const updated = [...settings];
    updated[index].push = !updated[index].push;
    setSettings(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save toggle state', error);
    }
  };

  const handleSubmit = async () => {
    const deviceId = Device.osInternalBuildId ?? 'unknown-device-id';

    const payload = {
      deviceId,
      expoPushToken,
      notificationPreferences: settings,
    };

    try {
      const response = await axios.post('https://visitmyjoburg.co.za/api/save-preferences', payload);
      if (response.status === 200) {
        Alert.alert('Success', 'Your preferences have been saved.');

        if (expoPushToken) {
          await sendTestPushNotification(expoPushToken);
        }
      } else {
        Alert.alert('Error', response.data?.message || 'Something went wrong.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send preferences.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {settings.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.question}>{item.question}</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.label}>Push</Text>
            <Switch value={item.push} onValueChange={() => togglePush(index)} />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.buttonContainer} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission required', 'Push notification permission is needed.');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
  } else {
    Alert.alert('Error', 'Push notifications only work on physical devices.');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// ✅ Axios-based push notification request to Expo
async function sendTestPushNotification(token: string) {
  try {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      sound: 'default',
      title: 'Preferences Saved ✅',
      body: 'Your notification preferences were updated successfully!',
    });
  } catch (err) {
    console.error('Failed to send push notification', err);
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 5,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
  },
  buttonContainer: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NotificationSettings;
