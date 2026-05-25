import { useCallback, useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { isTauri } from "@tauri-apps/api/core";
import type { SettingState } from "@features/settings/model";

type OverlayFriend = {
  id: string;
  nickname: string;
  stage: string;
  isTyping: boolean;
};

type UseOverlaySyncParams = {
  appSettings: SettingState;
  animationSpeedRef: RefObject<number>;
  mainPetStage: string;
  onlineFriendsForOverlay: OverlayFriend[];
  petState: string;
  setHiddenOverlayIds: Dispatch<SetStateAction<Set<string>>>;
  typingTick: number;
};

export const useOverlaySync = ({
  appSettings,
  animationSpeedRef,
  mainPetStage,
  onlineFriendsForOverlay,
  petState,
  setHiddenOverlayIds,
  typingTick,
}: UseOverlaySyncParams) => {
  const emitOverlayReset = useCallback(() => {
    if (!isTauri()) return;
    import("@tauri-apps/api/event").then(({ emit }) => {
      void emit("overlay-reset-positions");
    });
  }, []);

  const syncOverlay = useCallback(
    (stage: string, state: string, speed: number) => {
      if (!isTauri()) return;
      import("@tauri-apps/api/event").then(({ emit }) => {
        void emit("pet-state", { stage, state, speed });
      });
    },
    [],
  );

  const overlayFriendIdsKey = onlineFriendsForOverlay
    .map((friend) => friend.id)
    .join("|");

  useEffect(() => {
    syncOverlay(mainPetStage, petState, animationSpeedRef.current);
  }, [petState, mainPetStage, syncOverlay, animationSpeedRef, typingTick]);

  useEffect(() => {
    emitOverlayReset();
  }, [emitOverlayReset, mainPetStage]);

  useEffect(() => {
    emitOverlayReset();
  }, [emitOverlayReset, overlayFriendIdsKey]);

  useEffect(() => {
    if (!isTauri()) return;
    import("@tauri-apps/api/event").then(({ emit }) => {
      void emit("overlay-friends", { friends: onlineFriendsForOverlay });
    });
  }, [onlineFriendsForOverlay]);

  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | null = null;
    import("@tauri-apps/api/event").then(({ listen }) => {
      listen<{ id: string }>("overlay-hide-friend", ({ payload }) => {
        setHiddenOverlayIds((prev) => new Set([...prev, payload.id]));
      }).then((fn) => {
        unlisten = fn;
      });
    });
    return () => {
      unlisten?.();
    };
  }, [setHiddenOverlayIds]);

  const showFriendOnOverlay = useCallback(
    (id: string) => {
      setHiddenOverlayIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (!isTauri()) return;
      import("@tauri-apps/api/event").then(({ emit }) => {
        void emit("overlay-show-friend", { id });
        void emit("overlay-reset-positions");
      });
    },
    [setHiddenOverlayIds],
  );

  useEffect(() => {
    if (!isTauri()) return;
    import("@tauri-apps/api/core").then(({ invoke }) => {
      void invoke("set_overlay_visible", {
        visible: appSettings.showOverlay,
      });
    });
    if (appSettings.showOverlay) {
      emitOverlayReset();
    }
  }, [appSettings.showOverlay, emitOverlayReset]);

  return { showFriendOnOverlay };
};
