import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { apiCall } from '@/api/client';
import { useEffect, useState } from 'react';
import type { Collection } from '@/types/collection';
import { useAuth } from '@/context/AuthContext';

export default function Index() {
  const { token, isLoading } = useAuth(); // Added isLoading
  const [collections, setCollections] = useState<Collection[]>([]);

  const fetchCollections = async () => {
    try {
      const coles = await apiCall<Collection[]>("/collections");
      setCollections(coles);
    } catch (error) {
      console.error("Failed to fetch collections", error);
    }
  };

  useEffect(() => {
    // Only fetch if we actually have a token
    if (token) {
      fetchCollections();
    }
  }, [token]); // Re-run if token changes (e.g., after login)

  // 1. Show nothing or a spinner while checking the "safe" for the token
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // 2. If no token, show the "Please Login" message
  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please login to view collections</Text>
        <Link href="/profile" style={styles.loginLink}>
          Go to Login Screen
        </Link>
      </View>
    );
  }

  // 3. Normal view for logged-in users
  return (
    <View style={styles.container}>
      <View>
        {collections.map((c) => (
          <Link
            key={c.id}
            href={{
              pathname: "/learn",
              params: { collection_id: c.id },
            }}
            style={styles.text}>
            {c.name}
          </Link>
        ))}
      </View>

      <Link
        href={{
          pathname: "/edit-brick",
          params: { brick_id: 1 },
        }}
        style={[styles.text, { marginTop: 20 }]}>
        Edit Brick
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  loginLink: {
    fontSize: 16,
    color: 'blue',
    fontWeight: 'bold',
  }
});
