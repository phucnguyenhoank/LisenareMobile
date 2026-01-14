// api/streamClient.ts
import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/utils/authStorage";
import { fetch } from 'expo/fetch';

export const streamChat = async (
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void
) => {
  console.log(`messages:${messages}`);
  const response = await fetch(`${API_BASE_URL}/text/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getToken()}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) throw new Error('Streaming failed');
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunkValue = decoder.decode(value);
    onChunk(chunkValue); // Send new text to the UI state
  }
};

