import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import NotificationPopup from '@/components/NotificationPopup'; // adjust path if needed
const API_BASE_URL = 'https://lego-robotics.visitmyjoburg.co.za/api';


// Define your theme color here for easy modification
const BRAND_BACKGROUND_COLOR = '#f5f5f5'; // Example dark background color for your theme

export default function BookingPage() {
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [serverResponse, setServerResponse] = useState<string | null>(null);

  const showDatePicker = (modeType: 'date' | 'time') => {
    setShowPicker(true);
    setMode(modeType);
  };

  const onChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleBooking = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill out name and email.');
      return;
    }

    const bookingData = {
      name,
      email,
      datetime: date.toISOString(),
      notes,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const message = response.data.message || 'Booking submitted successfully!';
      setServerResponse(message);
      setIsSuccess(true);
      Alert.alert('Success', message);
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          setServerResponse(errorMessages);
          setIsSuccess(false);
          Alert.alert('Validation Error', errorMessages);
        } else {
          const message = data.message || 'Request failed';
          setServerResponse(message);
          setIsSuccess(false);
          Alert.alert('Error', message);
        }
      } else {
        const message = error.message || 'Failed to submit booking.';
        setServerResponse(message);
        setIsSuccess(false);
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.fullScreenCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <NotificationPopup />

          <Text style={styles.title}>Create call request</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#888" // Added for dark background visibility
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#888" // Added for dark background visibility
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Select Date and Time</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => showDatePicker('date')} style={styles.button}>
              <Text style={styles.buttonText}>Pick Date</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showDatePicker('time')} style={styles.button}>
              <Text style={styles.buttonText}>Pick Time</Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode={mode}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChange}
            />
          )}

          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Notes (optional)"
            placeholderTextColor="#888" // Added for dark background visibility
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleBooking}>
            <Text style={styles.submitButtonText}>
              {date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </TouchableOpacity>

          {serverResponse && (
            <View
              style={[
                styles.responseContainer,
                {
                  backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
                  borderColor: isSuccess ? '#c3e6cb' : '#f5c6cb',
                },
              ]}
            >
              <Text style={[styles.responseText, { color: isSuccess ? '#155724' : '#721c24' }]}>
                {serverResponse}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    marginTop:24,
    flex: 1,
    backgroundColor: BRAND_BACKGROUND_COLOR, // Changed to your theme color
  },
  fullScreenCard: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff', // Card background remains white for contrast
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 0,
    color: '#333', // Keep text dark for contrast on white card
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff', // Input background remains white
    color: '#333', // Text color inside input
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333', // Label text color
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ddd', // Button background
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000', // Button text color
  },
  selected: {
    marginBottom: 20,
    fontSize: 14,
    color: '#444',
  },
  submitButton: {
    backgroundColor: '#000', // Submit button background (can be themed)
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff', // Submit button text color
  },
  responseContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});