import { useEffect, useRef } from "react";

export default function usePlaybackSync({
  videoRef,
  uuid,
  isAutoSyncRef,
  MALidRef,
  epNumRef,
  username,
  sendOverWebsocket,
  loading,
}) {
  const lastSentRef = useRef(0);
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    function handleSyncPause() {
      const videoTime = videoElement.currentTime;
      const messagePayload = {
        type: "sync",
        MALid: MALidRef.current,
        epNum: epNumRef.current,
        username: username,
        content: null,
        time: videoTime,
        action: "pause",
        id: uuid,
      };
      if (!isAutoSyncRef.current) sendOverWebsocket(messagePayload);
      isAutoSyncRef.current = false;
    }
    function handleSyncPlay() {
      const videoTime = videoElement.currentTime;
      const messagePayload = {
        type: "sync",
        MALid: MALidRef.current,
        epNum: epNumRef.current,
        username: username,
        content: null,
        time: videoTime,
        action: "play",
        id: uuid,
      };
      if (!isAutoSyncRef.current) sendOverWebsocket(messagePayload);
      isAutoSyncRef.current = false;
    }
    function handleSyncTimeUpdate() {
      const now = Date.now();
      if (now - lastSentRef.current < 500) return;
      lastSentRef.current = now;

      const videoTime = videoElement.currentTime;
      const messagePayload = {
        type: "sync",
        MALid: MALidRef.current,
        epNum: epNumRef.current,
        username: username,
        content: null,
        time: videoTime,
        action: "timeupdate",
        id: uuid,
      };
      sendOverWebsocket(messagePayload);
    }
    function handleBuffer() {
      const videoTime = videoElement.currentTime;
      const messagePayload = {
        type: "sync",
        MALid: MALidRef.current,
        epNum: epNumRef.current,
        username: username,
        content: null,
        time: videoTime,
        action: "buffer",
        id: uuid,
      };
      sendOverWebsocket(messagePayload);
    }

    videoElement.addEventListener("pause", handleSyncPause);
    videoElement.addEventListener("play", handleSyncPlay);
    videoElement.addEventListener("timeupdate", handleSyncTimeUpdate);
    videoElement.addEventListener("waiting", handleBuffer);

    return () => {
      videoElement.removeEventListener("pause", handleSyncPause);
      videoElement.removeEventListener("play", handleSyncPlay);
      videoElement.removeEventListener("timeupdate", handleSyncTimeUpdate);
      videoElement.removeEventListener("waiting", handleBuffer);
    };
  }, [username, loading]);
}
