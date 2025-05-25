import React, { useState, useEffect } from 'react';
// Removed React Native specific imports and replaced with standard HTML elements and Tailwind CSS
// import { View, Text, TextInput, TouchableOpacity, Platform, Alert, StyleSheet, ScrollView } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Replaced with HTML input type="datetime-local"

// Assuming NotificationPopup is a standard React component that takes props for message and type
// Adjust the path if needed for your project structure
// import NotificationPopup from '@/components/NotificationPopup';
// For demonstration, let's create a simple NotificationPopup component if it's not provided
const NotificationPopup = ({ message, isSuccess, show, onClose }) => {
  if (!show) return null;

  const bgColor = isSuccess ? 'bg-green-100' : 'bg-red-100';
  const textColor = isSuccess ? 'text-green-800' : 'text-red-800';
  const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg ${bgColor} ${borderColor} border`} role="alert">
      <div className="flex items-center justify-between">
        <p className={`font-medium ${textColor}`}>{message}</p>
        <button onClick={onClose} className={`ml-4 ${textColor} hover:opacity-75`}>
          &times;
        </button>
      </div>
    </div>
  );
};


// Assuming axios is installed and API_BASE_URL is defined.
// For a web environment, you might define API_BASE_URL directly or use environment variables
// import { API_BASE_URL } from '@env'; // This is typically for React Native or specific build setups
const API_BASE_URL = 'https://api.example.com'; // Placeholder: Replace with your actual API base URL
import axios from 'axios';


export default function BookingPage() {
  const [isSuccess, setIsSuccess] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  // Initialize date with local datetime string for HTML input type="datetime-local"
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [serverResponse, setServerResponse] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  // Effect to hide notification after a few seconds
  useEffect(() => {
    let timer;
    if (showNotification) {
      timer = setTimeout(() => {
        setShowNotification(false);
        setServerResponse(null); // Clear message when hidden
        setIsSuccess(null); // Reset success state
      }, 5000); // Hide after 5 seconds
    }
    return () => clearTimeout(timer); // Cleanup timer
  }, [showNotification]);

  const handleBooking = async () => {
    // Basic validation
    if (!name || !email) {
      setServerResponse('Please fill out name and email.');
      setIsSuccess(false);
      setShowNotification(true);
      return;
    }

    const bookingData = {
      name,
      email,
      datetime: new Date(date).toISOString(), // Convert local datetime string back to ISO for API
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
      setShowNotification(true);
      // Clear form on success
      setName('');
      setEmail('');
      setNotes('');
      setDate(new Date().toISOString().slice(0, 16)); // Reset date to current
    } catch (error) {
      console.error(error);
      let message = 'Failed to submit booking.';
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          message = errorMessages;
        } else {
          message = data.message || 'Request failed';
        }
      } else if (error.message) {
        message = error.message;
      }
      setServerResponse(message);
      setIsSuccess(false);
      setShowNotification(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <NotificationPopup
        message={serverResponse}
        isSuccess={isSuccess}
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Create Call Request</h1>

        <div className="mb-6">
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
          <input
            id="fullName"
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="emailAddress" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
          <input
            id="emailAddress"
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="datetime" className="block text-gray-700 text-sm font-semibold mb-2">Select Date and Time</label>
          <input
            id="datetime"
            type="datetime-local" // HTML5 input type for date and time
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <label htmlFor="notes" className="block text-gray-700 text-sm font-semibold mb-2">Notes (optional)</label>
          <textarea
            id="notes"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-y"
            placeholder="Add any additional notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <button
          onClick={handleBooking}
          className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
        >
          Schedule Call for {new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </button>
      </div>
    </div>
  );
}
