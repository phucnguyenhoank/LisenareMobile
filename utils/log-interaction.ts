// utils/log-interaction.ts
import { request } from "@/services/client";

export enum InteractionType {
  LISTEN = "LISTEN",
  VIEW_TRANSLATION = "VIEW_TRANSLATION",
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
  REMOVE_REACTION = "REMOVE_REACTION",
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
  console.log(
    `snippetId:${snippetId} | type:${type}` +
      (duration != null ? ` | duration:${duration}` : ""),
  );
  await request("/snippet-interactions", {
    method: "POST",
    body: {
      session_id: sessionId,
      snippet_id: snippetId,
      interaction_type: type,
      duration,
    },
  });
}
