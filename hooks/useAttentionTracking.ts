import { SearchMode } from "@/types/context-search";
import { Snippet } from "@/types/snippet";
import { InteractionType, logInteraction } from "@/utils/log-interaction";
import { useMemo, useRef } from "react";
import { ViewToken } from "react-native";

function getAttentionItem(viewableItems: ViewToken[]) {
  if (viewableItems.length === 0) return null;

  // sort by index (important!)
  const sorted = [...viewableItems].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );

  // Exception: if first item in list is visible
  if (sorted[0]?.index === 0) {
    return (sorted[0].item as Snippet).id;
  }

  // default: pick middle
  const middleIndex = Math.floor(sorted.length / 2);

  return (sorted[middleIndex]?.item as Snippet)?.id ?? null;
}

export function useAttentionTracking({
  sessionId,
  mode,
}: {
  sessionId: string;
  mode: SearchMode;
}) {
  const modeRef = useRef(mode);
  modeRef.current = mode;
  // approximate the middle item user are paying attention to
  // store what item_id and the time it appeared in the screen
  const currentItemRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Track which item user is focusing on and how long they stay on it
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Only track in snippet mode
      if (modeRef.current !== "snippets") return;

      const now = Date.now();
      const nextId = getAttentionItem(viewableItems);

      // If attention shifts → log previous item
      if (nextId !== currentItemRef.current) {
        if (currentItemRef.current !== null) {
          const duration = (now - startTimeRef.current) / 1000;

          if (duration > 0.4) {
            logInteraction({
              sessionId,
              snippetId: currentItemRef.current,
              type: InteractionType.TIME_SPENT,
              duration,
            });
          }
        }

        // Start tracking new item
        currentItemRef.current = nextId;
        startTimeRef.current = now;
      }
    },
  ).current;

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 100,
    }),
    [],
  );

  return {
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
