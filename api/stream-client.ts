// api/stream-client.ts
import { API_BASE_URL } from "@/config/env";
import { getToken } from "@/utils/auth-storage";
import { fetch } from "expo/fetch";

export const streamChat = async (
  userQuestion: string,
  onChunk: (chunk: string) => void,
) => {
  console.log(`userQuestion:${userQuestion}`);
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`,
    },
    body: JSON.stringify({ learner_question: userQuestion }),
  });

  if (!response.ok) throw new Error("Streaming failed");

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunkValue = decoder.decode(value);
    onChunk(chunkValue);
  }
};
