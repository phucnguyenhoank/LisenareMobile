import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  StyleProp, 
  TextStyle 
} from 'react-native';
import colors from "@/theme/colors";

// Define the Props interface
interface TextButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline'; // Restricts to these two strings
  style?: StyleProp<ViewStyle>;    // Allows passing extra container styles
}

const TextButton: React.FC<TextButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style 
}) => {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.baseButton,
        isPrimary ? styles.primaryButton : styles.outlineButton,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[
        styles.baseText,
        isPrimary ? styles.primaryText : styles.outlineText
      ]}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600' as const, // Ensures TS treats this as a specific value
  },
  primaryText: {
    color: 'white',
  },
  outlineText: {
    color: '#666',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default TextButton;
