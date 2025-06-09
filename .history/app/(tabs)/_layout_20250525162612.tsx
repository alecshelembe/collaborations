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
    name="account"
    options={{
      title: 'Account',
      tabBarIcon: ({ color }) => <UserPlusIcon size={28} color={color} />,
    }}
  />
      <Tabs.Screen
                    name="posts"  // New screen name for posts
                    options={{
                      title: 'Posts',
                      tabBarIcon: ({ color }) => <DocumentTextIcon size={28} color={color} />, // Icon for posts
                    }}
                  />
      <Tabs.Screen
              name="index"
              options={{
                title: 'Feed',
                tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
              }}
            /><Tabs.Screen
                name="create"
                options={{
                  title: 'create',
                  tabBarIcon: ({ color }) => <PencilIcon size={28} color={color} />,
                }}
              />

      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <UsersIcon size={28} color={color} />,
        }}
      />

    </Tabs>
  );
}
