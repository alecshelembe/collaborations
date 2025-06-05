import React, { useState } from 'react';

// Main App component
export default function App() {
  const [isSuccess, setIsSuccess] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  // Initialize date to current local date and time for datetime-local input
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    // Format to YYYY-MM-DDTHH:MM for datetime-local input
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [serverResponse, setServerResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' or 'error'

  // Function to show a custom modal instead of Alert.alert
  const showCustomModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const handleBooking = async () => {
    if (!name || !email) {
      showCustomModal('Please fill out name and email.', 'error');
      return;
    }

    // Simulate API call
    const bookingData = {
      name,
      email,
      datetime: new Date(dateTime).toISOString(), // Convert local datetime string to ISO
      notes,
    };

    setServerResponse('Submitting booking...');
    setIsSuccess(null);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate a successful response
      const mockResponse = { data: { message: 'Booking submitted successfully!' } };
      // For testing error, uncomment the line below and comment the success line
      // throw { response: { status: 422, data: { errors: { email: ['The email is invalid.'], name: ['The name field is required.' ] } } } };

      const message = mockResponse.data.message || 'Booking submitted successfully!';
      setServerResponse(message);
      setIsSuccess(true);
      showCustomModal('Success: ' + message, 'success');

      // Clear form fields on success
      setName('');
      setEmail('');
      setNotes('');
      setDateTime(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      });

    } catch (error) {
      console.error("Booking error:", error);
      let errorMessage = 'Failed to submit booking.';
      let isError = true;

      // Simulate error response structure
      if (error && error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          const errorMessages = Object.values(data.errors).flat().join('\n');
          errorMessage = 'Validation Error:\n' + errorMessages;
        } else {
          errorMessage = data.message || 'Request failed';
        }
      } else if (error && error.message) {
        errorMessage = error.message;
      }

      setServerResponse(errorMessage);
      setIsSuccess(false);
      showCustomModal('Error: ' + errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-inter">
      {/* Booking Card Container */}
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Create Call Request</h1>

        {/* Name Input */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
          <input
            type="text"
            id="fullName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="emailAddress" className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
          <input
            type="email"
            id="emailAddress"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 placeholder-gray-400"
            placeholder="john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
          />
        </div>

        {/* Date and Time Picker */}
        <div className="mb-4">
          <label htmlFor="dateTime" className="block text-gray-700 text-sm font-semibold mb-2">Select Date and Time</label>
          <input
            type="datetime-local"
            id="dateTime"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>

        {/* Notes Textarea */}
        <div className="mb-6">
          <label htmlFor="notes" className="block text-gray-700 text-sm font-semibold mb-2">Notes (optional)</label>
          <textarea
            id="notes"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 placeholder-gray-400 h-24 resize-y"
            placeholder="Any specific requests or details?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleBooking}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Request Call for {new Date(dateTime).toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </button>

        {/* Server Response Display */}
        {serverResponse && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              isSuccess === true ? 'bg-green-100 border-green-400 text-green-700' :
              isSuccess === false ? 'bg-red-100 border-red-400 text-red-700' :
              'bg-blue-100 border-blue-400 text-blue-700'
            }`}
          >
            <p className="text-sm leading-relaxed">{serverResponse}</p>
          </div>
        )}
      </div>

      {/* Custom Modal for Alerts */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className={`text-xl font-bold mb-4 ${modalType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {modalType === 'success' ? 'Success!' : 'Error!'}
            </h2>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
