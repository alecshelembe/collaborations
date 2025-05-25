import React, { useState, useEffect } from 'react';
import { Modal, Text, View, Pressable, StyleSheet } from 'react-native';

type NotificationData = {
  title: string;
  message: string;
};

const NotificationPopup = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<NotificationData | null>(null);

  const fetchNotification = async () => {
    try {
      const response = await fetch('https://visitmyjoburg.co.za/api/main-notification');
      const json = await response.json();
      if (json.status === 'main-notification') {
        setNotification(json.data);
        setVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch notification:', error);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  const closeModal = () => {
    setVisible(false);
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={closeModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {notification && (
            <>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.title}>{notification.title}</Text>

            </>
          )}
          <Pressable style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationPopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  closeButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
