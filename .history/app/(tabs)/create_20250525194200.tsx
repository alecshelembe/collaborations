import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform, // Needed for platform-specific DateTimePicker display
  Alert,    // Re-introducing Alert for native alerts
  StyleSheet, // Re-introducing StyleSheet for React Native styling
  ScrollView, // Re-introducing ScrollView for scrollable content
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Re-introducing React Native DateTimePicker
import axios from 'axios';
// import NotificationPopup from '@/components/NotificationPopup'; // Removed custom web NotificationPopup

// Using the API_BASE_URL provided in the selection
const API_BASE_URL = 'https://lego-robotics.visitmyjoburg.co.za';


export default function BookingPage() {
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date()); // Date object for DateTimePicker
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [serverResponse, setServerResponse] = useState<string | null>(null); // Kept for potential future custom UI, though Alert is used now

  // Function to show the DateTimePicker for date or time
  const showDatePicker = (modeType: 'date' | 'time') => {
    setShowPicker(true);
    setMode(modeType);
  };

  // Handler for when a date/time is selected
  const onChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false); // Hide picker after selection
    if (selectedDate) {
      setDate(selectedDate); // Update the date state
    }
  };

  // Function to handle the booking submission
  const handleBooking = async () => {
    // Basic validation for name and email
    if (!name || !email) {
      Alert.alert('Error', 'Please fill out name and email.');
      return;
    }

    // Prepare booking data payload
    const bookingData = {
      name,
      email,
      datetime: date.toISOString(), // Convert Date object to ISO string for API
      notes,
    };

    try {
      // Make the API call to submit the booking
      const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Extract message from response or use a default success message
      const message = response.data.message || 'Booking submitted successfully!';
      setServerResponse(message); // Update server response state
      setIsSuccess(true); // Set success status
      Alert.alert('Success', message); // Show success alert

      // Clear form fields on successful submission
      setName('');
      setEmail('');
      setNotes('');
      setDate(new Date()); // Reset date to current
    } catch (error: any) {
      console.error(error); // Log the error for debugging

      // Handle different types of errors from the API call
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) { // Validation errors (e.g., from Laravel backend)
          const errorMessages = Object.values(data.errors).flat().join('\n');
          setServerResponse(errorMessages);
          setIsSuccess(false);
          Alert.alert('Validation Error', errorMessages);
        } else { // Other HTTP errors
          const message = data.message || 'Request failed';
          setServerResponse(message);
          setIsSuccess(false);
          Alert.alert('Error', message);
        }
      } else { // Network errors or other unexpected errors
        const message = error.message || 'Failed to submit booking.';
        setServerResponse(message);
        setIsSuccess(false);
        Alert.alert('Error', message);
      }
    }
  };

  return (
    // ScrollView allows content to scroll if it exceeds screen height
    <ScrollView contentContainerStyle={styles.container}>
      {/* NotificationPopup removed as Alert.alert is used for simplicity in React Native */}
      {/* <NotificationPopup /> */}

      {/* Title of the booking page */}
      <Text style={styles.title}>Create Call Request</Text>

      {/* Input for Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName} // Use onChangeText for TextInput
      />

      {/* Input for Email Address */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address" // Specific keyboard type for emails
        autoCapitalize="none" // Prevent auto-capitalization for email
        value={email}
        onChangeText={setEmail}
      />

      {/* Label for Date and Time selection */}
      <Text style={styles.label}>Select Date and Time</Text>
      <View style={styles.row}>
        {/* Button to pick date */}
        <TouchableOpacity onPress={() => showDatePicker('date')} style={styles.button}>
          <Text style={styles.buttonText}>Pick Date</Text>
        </TouchableOpacity>
        {/* Button to pick time */}
        <TouchableOpacity onPress={() => showDatePicker('time')} style={styles.button}>
          <Text style={styles.buttonText}>Pick Time</Text>
        </TouchableOpacity>
      </View>

      {/* DateTimePicker component, conditionally rendered */}
      {showPicker && (
        <DateTimePicker
          value={date} // Current date/time value
          mode={mode} // 'date' or 'time'
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Different display for iOS/Android
          onChange={onChange} // Handler for value change
        />
      )}

      {/* Input for Notes (optional) */}
      <TextInput
        style={[styles.input, { height: 80 }]} // Multi-line input with fixed height
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline // Enable multi-line input
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleBooking}>
        <Text style={styles.submitButtonText}>
          Create Call Request For:{' '}
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

      {/* Display server response (optional, as Alert is also used) */}
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
  );
}

// StyleSheet for React Native components
const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1, // Allows ScrollView to take full height and scroll
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 50,
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
    gap: 10, // gap property for spacing between items in a row
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    flex: 1, // Allows buttons to take equal width in the row
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
    // Background and border colors will be dynamically set based on success/failure
    borderWidth: 1,
    borderRadius: 8,
  },
  responseText: {
    fontSize: 14,
    // Text color will be dynamically set based on success/failure
    lineHeight: 20,
  },
});
