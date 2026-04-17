// utils/log-interaction.ts
import { request } from "@/api/client";

export enum InteractionType {
  LISTEN = "LISTEN",
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
  ADD = "ADD",
  TIME_SPENT = "TIME_SPENT",
}

export async function logInteraction({
  sessionId,
  snippetId,
  type,
  duration,
}: {
  sessionId: string;
  snippetId: number;
  type: InteractionType;
  duration?: number;
}) {
  console.log(`snippetId:${snippetId} | type:${type} duration ${duration}`);
  try {
    await request("/snippet-interactions", {
      method: "POST",
      body: {
        session_id: sessionId,
        snippet_id: snippetId,
        interaction_type: type,
        duration,
      },
    });
  } catch (e) {
    // let it silently fails
  }
}
