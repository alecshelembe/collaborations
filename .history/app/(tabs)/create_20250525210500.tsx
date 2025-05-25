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
      // Replaced Alert.alert with a more user-friendly NotificationPopup or similar
      // For now, keeping Alert.alert as per original code, but noting it should be replaced by NotificationPopup
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
      const response = await axios.post('https://visitmyjoburg.co.za/api/bookings', bookingData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const message = response.data.message || 'Booking submitted successfully!';
      setServerResponse(message);
      setIsSuccess(true); // ✅ Success
      Alert.alert('Success', message); // Replace with NotificationPopup
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          setServerResponse(errorMessages);
          setIsSuccess(false); // ❌ Validation Error
          Alert.alert('Validation Error', errorMessages); // Replace with NotificationPopup
        } else {
          const message = data.message || 'Request failed';
          setServerResponse(message);
          setIsSuccess(false); // ❌ Other server error
          Alert.alert('Error', message); // Replace with NotificationPopup
        }
      } else {
        const message = error.message || 'Failed to submit booking.';
        setServerResponse(message);
        setIsSuccess(false); // ❌ Network error
        Alert.alert('Error', message); // Replace with NotificationPopup
      }
    }
  };

  return (
    // Outer container for the entire screen, giving space for the card
    <View style={styles.screenContainer}>
      {/* The full-screen card that holds all your content */}
      <View style={styles.fullScreenCard}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* NotificationPopup is placed outside the scrollable content if it's a fixed overlay */}
          {/* If NotificationPopup is meant to scroll with content, keep it inside ScrollView */}
          {/* For now, keeping it here as per your original code structure */}
          <NotificationPopup />

          <Text style={styles.title}>Create call request</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
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
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleBooking}>
            <Text style={styles.submitButtonText}>
              {/* Create Call Request For:{' '} */}
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
    flex: 1, // Ensures the screen container takes full height
    backgroundColor: '#f5f5f5', // Background color for the entire screen
  },
  fullScreenCard: {
    flex: 1, // Makes the card fill the available space within its parent
    margin: 16, // Adds some margin around the card from the screen edges
    backgroundColor: '#fff', // White background for the card
    borderRadius: 10, // Rounded corners for a card look
    shadowColor: '#000', // Shadow for depth (iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5, // Elevation for depth (Android)
    overflow: 'hidden', // Ensures content doesn't spill outside rounded corners
  },
  scrollContent: {
    padding: 24, // Internal padding for the scrollable content
    flexGrow: 1, // Allows ScrollView content to grow and fill space
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 0, // Adjusted to 0 as the card now has its own padding
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
  },
  selected: {
    marginBottom: 20,
    fontSize: 14,
    color: '#444',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
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