import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { FontAwesome, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_image_url: string;
  google_location: string;
  google_latitude: string;
  google_longitude: string;
  google_location_type: string;
  google_postal_code: string;
  google_city: string;
  web_source: string;
  location_id: number;
  package_selected: string;
  ref: string;
  position: string;
  influencer: number;
  instagram_handle: string;
  tiktok_handle: string;
  linkedin_handle: string;
  x_handle: string;
  youtube_handle: string;
  other_handle: string;
}

const UserProfileCard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://visitmyjoburg.co.za/api/users");

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Failed to fetch users`);
        }

        const data = await response.json();
        if (!data.data || data.data.length === 0) {
          throw new Error("No users found.");
        }

        setUsers(data.data);
      } catch (error: any) {
        setError(error.message || "Something went wrong, please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLinkPress = (url: string | undefined) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const renderUserCard = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: 'https://visitmyjoburg.co.za/storage/' + item.profile_image_url }} style={styles.profileImage} />
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.name}>{item.first_name}</Text>

        <View style={styles.socialLinks}>
          {item.instagram_handle && (
            <TouchableOpacity onPress={() => handleLinkPress(`${item.instagram_handle}`)}>
              <FontAwesome name="instagram" size={20} color="black" style={styles.socialIcon} />
            </TouchableOpacity>
          )}
          {item.tiktok_handle && (
            <TouchableOpacity onPress={() => handleLinkPress(`${item.tiktok_handle}`)}>
              <MaterialCommunityIcons name="tiktok" size={20} color="black" style={styles.socialIcon} />
            </TouchableOpacity>
          )}
          {item.linkedin_handle && (
            <TouchableOpacity onPress={() => handleLinkPress(`${item.linkedin_handle}`)}>
              <AntDesign name="linkedin-square" size={20} color="black" style={styles.socialIcon} />
            </TouchableOpacity>
          )}
          {item.youtube_handle && (
            <TouchableOpacity onPress={() => handleLinkPress(`${item.youtube_handle}`)}>
              <AntDesign name="youtube" size={20} color="black" style={styles.socialIcon} />
            </TouchableOpacity>
          )}
        </View>
        
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user profiles...</Text>
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
    <FlatList
      data={users}
      renderItem={renderUserCard}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    marginTop:25
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'column', // Changed to column for image first
    flex: 1,
    marginHorizontal: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Add space between image and info
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    width: '100%', // Full width for info
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: 'center', // Center text
  },
  email: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
    textAlign: 'center', // Center text
  },
  phone: {
    fontSize: 12,
    color: "#777",
    marginBottom: 2,
    textAlign: 'center', // Center text
  },
  location: {
    fontSize: 12,
    marginBottom: 5,
    color: "#555",
    textAlign: 'center', // Center text
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center social icons
    marginTop: 5,
  },
  socialIcon: {
    marginHorizontal: 3,
  },
  viewProfileButton: {
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  viewProfileButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
});

export default UserProfileCard;