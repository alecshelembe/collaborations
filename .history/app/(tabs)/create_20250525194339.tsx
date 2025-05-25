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
      Alert.alert('Success', message);
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          setServerResponse(errorMessages);
          setIsSuccess(false); // ❌ Validation Error
          Alert.alert('Validation Error', errorMessages);
        } else {
          const message = data.message || 'Request failed';
          setServerResponse(message);
          setIsSuccess(false); // ❌ Other server error
          Alert.alert('Error', message);
        }
      } else {
        const message = error.message || 'Failed to submit booking.';
        setServerResponse(message);
        setIsSuccess(false); // ❌ Network error
        Alert.alert('Error', message);
      }
    }

  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <NotificationPopup />

      <Text style={styles.title}>Create </Text>
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
  ); // 👈 This closes the return block
  } // 👈 ADD THIS to close the BookingPage function


const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
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
    marginBottom:15,
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
