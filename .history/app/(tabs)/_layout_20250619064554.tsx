import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import {
  HomeIcon,
  LockClosedIcon,
  UserPlusIcon,
  UsersIcon,
  PencilIcon,
  DocumentTextIcon,  // Importing an icon for posts
} from 'react-native-heroicons/solid'; // Or use /outline for outline versions

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
      name="settings"
      options={{
        title: 'Settings',
        tabBarIcon: ({ color }) => <UserPlusIcon size={28} color={color} />,
      }}
    />

    <Tabs.Screen
      name="posts"
      options={{
        title: 'In Store',
        tabBarIcon: ({ color }) => <ArchiveBoxIcon size={28} color={color} />,
        // If using @expo/vector-icons:
        // tabBarIcon: ({ color }) => <MaterialCommunityIcons name="shopping-outline" size={28} color={color} />,
      }}
    />

    <Tabs.Screen
      name="index"
      options={{
        title: 'Buy Now',
        tabBarIcon: ({ color }) => <ShoppingCartIcon size={28} color={color} />,
        // If using @expo/vector-icons:
        // tabBarIcon: ({ color }) => <FontAwesome name="shopping-cart" size={28} color={color} />,
      }}
    />

    <Tabs.Screen
      name="rules" // Consider renaming this screen file to 'news.tsx' for clarity
      options={{
        title: 'News',
        tabBarIcon: ({ color }) => <NewspaperIcon size={28} color={color} />,
        // If using @expo/vector-icons:
        // tabBarIcon: ({ color }) => <FontAwesome name="newspaper-o" size={28} color={color} />,
      }}
    />

      <Tabs.Screen
        name="users"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <UsersIcon size={28} color={color} />,
        }}
      />

    </Tabs>
  );
}
