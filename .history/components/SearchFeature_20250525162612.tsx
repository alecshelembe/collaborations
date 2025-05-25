import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import axios from 'axios';

type SearchResult = {
  id: string;
  place_name: string;
  description?: string;
  image_url?: string;
};

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedPost, setSelectedPost] = useState<SearchResult | null>(null);

  // Debounce input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('https://visitmyjoburg.co.za/api/search', {
          query: debouncedQuery,
        });
        setResults(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />

      {loading && <ActivityIndicator style={styles.loader} size="small" color="#000" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <TouchableOpacity
              style={styles.viewButtonText}
              onPress={() => setSelectedPost(item)}
            >
             <Text style={styles.title}>{item.place_name}</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading && debouncedQuery ? (
            <Text style={styles.noResults}>No results found</Text>
          ) : null
        }
      />

      {/* Modal to show full post */}
      <Modal
        visible={!!selectedPost}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedPost?.place_name}</Text>
              <Text>{selectedPost?.description}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPost(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  loader: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  resultItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  title: {
    color: '#000',
    fontWeight: 'bold',
  },
  viewButton: {
    marginTop: 8,
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#fff',
  },
});
 export default SearchComponent;
