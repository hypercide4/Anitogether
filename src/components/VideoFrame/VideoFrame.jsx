import { useEffect, useRef, useState } from "react";
import "../AnimePicker/AnimePicker.css";
import Hls from "hls.js";

function VideoFrame({
  src,
  subs,
  videoRef,
  sendOverWebsocket,
  username,
  MALidRef,
  epNumRef,
  epNum,
  isAutoSyncRef,
  uuid,
}) {
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [quality, setQuality] = useState(-1); // -1 means Auto
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
        id:uuid,
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

    videoElement.addEventListener("pause", handleSyncPause);
    videoElement.addEventListener("play", handleSyncPlay);
    videoElement.addEventListener("timeupdate", handleSyncTimeUpdate);

    return () => {
      videoElement.removeEventListener("pause", handleSyncPause);
      videoElement.removeEventListener("play", handleSyncPlay);
      videoElement.removeEventListener("timeupdate", handleSyncTimeUpdate);
    };
  }, [username]);

  useEffect(() => {
    const video = videoRef.current;

    if (!src || !video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLevels(data.levels);
        setQuality(-1);
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  function changeQuality(event) {
    const level = Number(event.target.value);
    setQuality(level);

    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  }

  return (
    <div>
      <video
        ref={videoRef}
        controls
        playsInline
        className="anime-frame"
        crossOrigin="anonymous"
        autoPlay
      >
        <track
          src={subs}
          kind="subtitles"
          srcLang="en"
          label="English"
          default
        />
      </video>
      {levels.length > 0 && (
        <>
          <label className="quality-label">
            <select
              value={quality}
              onChange={changeQuality}
              className="quality-selection"
            >
              <option value={-1}>Auto</option>
              {levels.map((level, index) => (
                <option key={`${level.height}-${index}`} value={index}>
                  {level.height
                    ? `${level.height}p`
                    : `${Math.round(level.bitrate / 1000)} kbps`}
                </option>
              ))}
            </select>
            Quality, Episode {epNum}
          </label>
        </>
      )}
    </div>
  );
}

export default VideoFrame;
