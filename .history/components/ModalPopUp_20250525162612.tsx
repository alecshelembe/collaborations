import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

const ModalPopUp = ({ locationData, onClose }) => {
  const actualLocation = locationData?.near_address;
  const images = actualLocation?.images ? JSON.parse(actualLocation.images) : [];
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const baseURL = 'https://visitmyjoburg.co.za/';

  const openImageViewer = (index) => {
    setCurrentImageIndex(index);
    setIsImageViewVisible(true);
  };

  const handleClose = () => {
    if (isImageViewVisible) {
      setIsImageViewVisible(false);
    } else {
      onClose();
    }
  };


  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
       visible={!!actualLocation && typeof actualLocation === 'object'}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Near you</Text>
            {actualLocation ? (
              <ScrollView style={styles.card}>
                <Text style={styles.placeName}>{actualLocation.place_name}</Text>

                {/* Thumbnails */}
                {images.length > 0 && (
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {images.map((image, index) => (
                      <Image
                        key={index}
                        source={{ uri: `${baseURL}${image}` }}
                        style={styles.thumbnail}
                        onTouchEnd={() => openImageViewer(index)} // onTouchEnd instead of onPress
                      />
                    ))}
                  </ScrollView>
                )}

                <Text style={styles.label}>{actualLocation.address}</Text>
                <Text style={styles.description}>{actualLocation.description}</Text>
                <Text style={styles.label}>Booking Fee: {actualLocation.fee} ZAR</Text>

                {actualLocation.extras && (
                  <Text style={styles.label}>
                    Amenities: {actualLocation.extras.join(', ')}
                  </Text>
                )}

                {actualLocation.note && (
                  <Text style={styles.note}>Note: {actualLocation.note}</Text>
                )}

                {actualLocation.email && (
                  <Text
                    style={styles.email}
                    onPress={() => Linking.openURL(`mailto:${actualLocation.email}`)}
                  >
                    Contact: {actualLocation.email}
                  </Text>
                )}

                {actualLocation.video_link && (
                  <Text
                    style={styles.link}
                    onPress={() => Linking.openURL(actualLocation.video_link)}
                  >
                    ▶ Watch Video
                  </Text>
                )}

                {actualLocation.comments?.length > 0 && (
                  <View style={styles.comments}>
                    <Text style={styles.commentTitle}>Comments:</Text>
                    {actualLocation.comments.map((c, i) => (
                      <Text key={i} style={styles.comment}>
                        {c.author}: {c.content}
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            ) : (
              <Text>No data available</Text>
            )}
            <View style={styles.closeButtonWrapper}>
              <Button title="✕ Close" onPress={handleClose} color="#333" />
            </View>


          </View>
        </View>
      </Modal>

      <ImageViewing
        images={images.map((image) => ({ uri: `${baseURL}${image}` }))}
        imageIndex={currentImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButtonWrapper: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden', // gives rounded corners effect
    borderColor: '#ccc',
    borderWidth: 1,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 6,
  },
  note: {
    fontStyle: 'italic',
    marginBottom: 6,
  },
  email: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  link: {
    color: 'blue',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  comments: {
    marginTop: 10,
  },
  commentTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  comment: {
    fontSize: 13,
    marginBottom: 2,
  },
});

export default ModalPopUp;
