import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Link } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { apiCall } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import colors from '@/theme/colors';
import type { Collection } from '@/types/collection';

export default function Index() {
  const { token, isLoading } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const fetchCollections = async () => {
    try {
      const data = await apiCall<Collection[]>('/collections');
      setCollections(data);
    } catch (err) {
      console.error('Failed to fetch collections', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCollections();
    }
  }, [token]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!token) {
    return (
      <View style={styles.centered}>
        <Text>Please login to view collections</Text>
        <Link href="/profile" style={styles.loginLink}>
          Go to Login Screen
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.list}>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={{
              pathname: '/learn',
              params: { collection_id: collection.id },
            }}
            asChild
          >
            <TouchableOpacity style={styles.listItem} activeOpacity={0.6}>
              <View style={styles.left}>
                <Text style={styles.listItemText} numberOfLines={1}>
                  {collection.name}
                </Text>
              </View>

              <Entypo name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {isFabOpen && (
          <View style={styles.menuItems}>
            <Pressable
              style={styles.miniFab}
              onPress={() => {
                Alert.alert('Create New Brick');
                setIsFabOpen(false);
              }}
            >
              <MaterialCommunityIcons
                name="card-plus-outline"
                size={24}
                color="white"
              />
            </Pressable>

            <Pressable
              style={styles.miniFab}
              onPress={() => {
                Alert.alert('Create New Collection');
                setIsFabOpen(false);
              }}
            >
              <MaterialCommunityIcons
                name="folder-plus-outline"
                size={24}
                color="white"
              />
            </Pressable>
          </View>
        )}

        <Pressable
          style={styles.fab}
          onPress={() => setIsFabOpen((prev) => !prev)}
        >
          <AntDesign
            name={isFabOpen ? 'close' : 'plus'}
            size={24}
            color="white"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  list: {
    padding: 12,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  left: {
    flex: 1,
    paddingRight: 8, // space before chevron
  },

  listItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  loginLink: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },

  fabContainer: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    alignItems: 'center',
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  menuItems: {
    marginBottom: 10,
    alignItems: 'center',
  },

  miniFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,

    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',

    elevation: 4,
  },
});
