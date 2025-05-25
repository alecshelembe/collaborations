import React, { useState, useEffect } from "react";
import { firebaseApp } from "@/firebase"; // Adjust path to match your project
import { WebView } from "react-native-webview";
import ThemedButton from "@/components/ThemedButton";
import { ThemedView } from '@/components/ThemedView';
import SearchComponent from "@/components/SearchFeature";
import ImageViewing from 'react-native-image-viewing';
import { TouchableOpacity } from 'react-native';


import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

// Packages to install:
// npm install react-native-webview

interface SocialPost {
  id: number;
  fee: string;
  description: string;
  images: string[];
  email: string;
  status: string;
  comments: { id: number; author: string; content: string; created_at: string }[] | null;
  place_name: string;
  created_at: string;
  video_link: string | null;
  extras: string[] | null; // Renamed amenities to extras to match API
  profile_image_url: string | null; // Added profile_image_url
}


const SocialPostCard: React.FC = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<{ uri: string }[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://visitmyjoburg.co.za/api/get-social-posts");
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch posts`);
        }
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          const parsedData = data.data.map((post) => ({
            ...post,
            images: JSON.parse(post.images),
            extras: post.extras || null, // Keep extras as is
          }));
          setPosts(parsedData);
        } else {
          setError("Invalid data from API.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const getYouTubeVideoId = (url: string | null): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderPostCard = ({ item }: { item: SocialPost }) => {
    const videoId = getYouTubeVideoId(item.video_link);
    return (
      <View style={styles.card}>
      <SearchComponent/>
        <View style={styles.header}>
          {item.profile_image_url ? (
            <Image
              source={{ uri: `https://visitmyjoburg.co.za/storage/${item.profile_image_url}` }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{item.first_name}</Text>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
        <View style={styles.detailsCard}>
            <Text style={styles.description}>{item.address}</Text>
           <Text style={styles.title}>{item.place_name}</Text>
          {/*<Text style={styles.fee}>R {item.fee}</Text>*/}
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.description}>{item.note}</Text>
        </View>

        {item.images && item.images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
            {item.images.map((img, index) => {
              const imageUri = `https://visitmyjoburg.co.za/${img}`;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setViewerImages(item.images.map(i => ({ uri: `https://visitmyjoburg.co.za/${i}` })));
                    setCurrentImageIndex(index);
                    setIsViewerVisible(true);
                  }}
                >
                  <Image source={{ uri: imageUri }} style={styles.image} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.noImagesText}>No images available.</Text>
        )}


        {videoId && (
          <View style={styles.videoContainer}>
            <WebView
              style={styles.webView}
              javaScriptEnabled={true}
              source={{ uri: `https://www.youtube.com/embed/${videoId}` }}
            />
          </View>
        )}

        {item.extras && item.extras.length > 0 && (
          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenitiesTitle}>Amenities:</Text>
            <Text style={styles.amenitiesText}>{item.extras.join(', ')}</Text>
          </View>
        )}

        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsTitle}>Comments:</Text>
            {item.comments.map((comment, index) => (
              <Text key={index} style={styles.commentText}>
                <Text style={styles.commentAuthor}>{comment.author}: </Text>
                {comment.content}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      <ImageViewing
        images={viewerImages}
        imageIndex={currentImageIndex}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
      />

      {/* Add Button Here */}
      <ThemedView style={styles.buttonContainer}>
        <ThemedButton title="Get My location!" theme="primary" onPress={() => alert("Button Pressed!")} />
      </ThemedView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  popup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: { padding: 16, marginTop: 25 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  detailsCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 4, color: "#333" },
  date: { fontSize: 12, color: "#777", marginBottom: 8 },
  fee: { fontSize: 16, marginBottom: 8, color: "#444" },
  description: { fontSize: 15, color: "#555", marginBottom: 16, lineHeight: 22 },
  imageContainer: { marginBottom: 16, flexDirection: "row" },
  image: { width: 200, height: 200, borderRadius: 8, marginRight: 12 },
  commentsContainer: { marginTop: 16 },
  commentsTitle: { fontWeight: "600", marginBottom: 8, color: "#333" },
  commentText: { fontSize: 14, color: "#666", marginBottom: 4 },
  commentAuthor: { fontWeight: 'bold' },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 18, textAlign: "center" },
  noImagesText: { fontStyle: "italic", color: "#aaa", marginTop: 12 },
  videoContainer: {
    width: "100%",
    height: 250,
    marginTop: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
  },
  amenitiesContainer: {
    marginTop: 16,
  },
  amenitiesTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  amenitiesText: {
    fontSize: 14,
    color: '#666',
  }
});

export default SocialPostCard;