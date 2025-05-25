import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useColorScheme, // Import useColorScheme
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import RenderHtml from 'react-native-render-html';
import SearchComponent from "@/components/SearchFeature";

interface SciencePost {
  id: number;
  title: string;
  description: string;
  author: string;
  image_url: string[];
  created_at: string;
  space: number;
}

const windowWidth = Dimensions.get('window').width;
const imageSpacing = 10; // Gap between images
const space = 24; // Gap between images
const numColumns = 2; // 2 images per row (2x2 grid)
const imageSize = (windowWidth - imageSpacing - space * (numColumns + 1)) / numColumns; // Adjusted image size for 2 columns

const SciencePostsPage = () => {
  const colorScheme = useColorScheme(); // Get the user's system color scheme
  const themeBackgroundColor = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5'; // Choose background based on theme

  const [posts, setPosts] = useState<SciencePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState<{ uri: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://visitmyjoburg.co.za/api/get-science-posts');
        const result = await response.json();
        if (result?.status === 'success') {
          const parsed = result.data.map((post: any) => ({
            ...post,
            image_url: JSON.parse(post.image_url),
          }));
          setPosts(parsed);
        }
      } catch (error) {
        console.error('Failed to fetch science posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const openViewer = (images: string[], index: number) => {
    setViewerImages(images.map(img => ({ uri: `https://visitmyjoburg.co.za/${img}` })));
    setCurrentIndex(index);
    setViewerVisible(true);
  };

  if (loading) {
    return (
      // Use the dynamically determined theme background color
      <View style={[styles.screenContainer, { backgroundColor: themeBackgroundColor }]}>
        <View style={styles.centeredCard}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </View>
    );
  }

  const renderPost = ({ item }: { item: SciencePost }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <RenderHtml contentWidth={windowWidth - 32} source={{ html: item.description }} />
      <Text style={styles.author}>By: {item.author}</Text>
      <View style={styles.gridContainer}>
        {item.image_url.map((img, i) => (
          <TouchableOpacity key={i} onPress={() => openViewer(item.image_url, i)}>
            <Image
              source={{ uri: `https://visitmyjoburg.co.za/${img}` }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    // Use the dynamically determined theme background color
    <View style={[styles.screenContainer, { backgroundColor: themeBackgroundColor }]}>
      <View style={styles.fullScreenCard}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <SearchComponent />

          {posts.map((post) => (
            <View key={post.id}>{renderPost({ item: post })}</View>
          ))}
        </ScrollView>
      </View>
      <ImageViewing
        images={viewerImages}
        imageIndex={currentIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    // Background color is now set dynamically in the component
  },
  fullScreenCard: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff', // Card background remains white for contrast
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  centeredCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
  },
  author: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginLeft: -imageSpacing / 2,
    marginRight: -imageSpacing / 2,
  },
  gridImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 10,
    marginBottom: imageSpacing,
    marginLeft: imageSpacing / 2,
    marginRight: imageSpacing / 2,
  },
});

export default SciencePostsPage;