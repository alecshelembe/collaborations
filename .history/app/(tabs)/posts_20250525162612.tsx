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
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import RenderHtml from 'react-native-render-html';

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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
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
    <ScrollView contentContainerStyle={styles.container}>
      {posts.map((post) => (
        <View key={post.id}>{renderPost({ item: post })}</View>
      ))}
      <ImageViewing
        images={viewerImages}
        imageIndex={currentIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginTop:'22',
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
    marginLeft: -imageSpacing / 2, // To compensate for the margin right between items
    marginRight: -imageSpacing / 2, // To compensate for the margin left between items
  },
  gridImage: {
    width: imageSize, // Image size based on 2 columns
    height: imageSize, // Square images
    borderRadius: 10,
    marginBottom: imageSpacing, // Gap between rows
    marginLeft: imageSpacing / 2, // Space between images horizontally
    marginRight: imageSpacing / 2, // Space between images horizontally

  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SciencePostsPage;
