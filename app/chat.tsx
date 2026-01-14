import { streamChat } from '@/api/streamClient';
import colors from '@/theme/colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Define the Message type
type Message = { role: 'user' | 'assistant'; content: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText(''); // Clear input immediately for UX

    const newUserMsg: Message = { role: 'user', content: userText };
    const updatedHistory = [...messages, newUserMsg];
    setMessages([...updatedHistory, {role: 'assistant', content: ''}])
    
    try {
      await streamChat(updatedHistory, (chunk) => {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          const otherMsgs = prev.slice(0, -1);
          return [...otherMsgs, { ...lastMsg, content: lastMsg.content + chunk }];
        });
      });
    } catch (error) {
      console.error("Streaming error:", error);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.container}
      >
        {messages.map((msg, index) => (
          <View key={index} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
            <Text style={msg.role === 'user' ? styles.userMessageText : styles.botMessageText}>{msg.content}</Text>
          </View>
        ))}
      </KeyboardAwareScrollView>
      <SafeAreaView
        edges={['bottom']} 
        style={{ backgroundColor: 'white' }}
      >
        <KeyboardStickyView
          offset={{
            closed: 0,
            opened: insets.bottom
          }}
        >
          <View style={styles.inputBar}>
            <TextInput
              placeholder="Type a message..." 
              style={styles.textInput} 
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
            />
            <Pressable
              onPress={sendMessage}
            >
              <FontAwesome 
                name="paper-plane" 
                size={24} 
                color={colors.secondary2} 
                style={styles.sendButton} 
              />
            </Pressable>
          </View>
        </KeyboardStickyView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: colors.secondary,
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#E9E9EB',
    alignSelf: 'flex-start',
  },
  userMessageText: {
    color: 'white',
  },
  botMessageText: {
    color: 'black',
  },
  textInput: {
    height: 45,
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#d8d8d8',
    backgroundColor: '#fff',
    padding: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  sendButton: {
    padding: 4,
    marginTop: 2,
    marginRight: 4,
  }
});
