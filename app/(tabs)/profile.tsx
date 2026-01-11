import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiCall } from '@/api/client';
import type { Token } from '@/types/token';
import { Link } from 'expo-router';

export default function Profile() {
  const { token, login, logout } = useAuth();

  const handleLogin = async () => {
    const formBody = new URLSearchParams({
      grant_type: "password",
      "username": "qwer",
      "password": "1234",
      scope: "",
      client_id: "string",
      client_secret: "********",
    });

    const token = await apiCall<Token>("/auth/login", {
      method: "POST",
      data: formBody
    });

    const accessToken = token.access_token;
    await login(accessToken);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {token ? (
        <Text>Hello, {token}...</Text>
      ) : (
        <Text>Hello, Guest.</Text>
      )}

      <Button title="Sign In" onPress={handleLogin} />
      <Button title="Sign Out" onPress={logout} />
    </View>
  );
}
