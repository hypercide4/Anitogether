import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import usePlaybackSync from "../../hooks/usePlaybackSync";
import "./VideoFrame.css";
import "../../globals.css";

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
  selectedId,
  setEpNum,
  loading,
  fetchEpisode,
}) {
  const hlsRef = useRef(null);
  const [levels, setLevels] = useState([]);
  const [quality, setQuality] = useState(-1); // -1 means Auto

  usePlaybackSync({
    videoRef,
    uuid,
    isAutoSyncRef,
    MALidRef,
    epNumRef,
    username,
    sendOverWebsocket,
    loading,
  });

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
        setQuality(-1); // -1 means default
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

  async function changeEpisodeBy(amount) {
    const current = Number(epNumRef.current);
    const nextEpisode = current + amount;

    if (
      !selectedId ||
      !Number.isInteger(current) ||
      current < 1 ||
      nextEpisode < 1
    )
      return;

    try {
      //epnumRef stores episode numbers as strings i.e "3" so have to convert into 3 first to do math and then convert back to string
      epNumRef.current = String(nextEpisode);
      setEpNum(String(nextEpisode));
      await fetchEpisode(selectedId, nextEpisode);
    } catch (error) {
      console.log("couldn't load episode, error: ", error);
      setEpNum(String(nextEpisode - amount));
      epNumRef.current = String(nextEpisode - amount);
    }
  }

  if (!loading) {
    return (
      <>
        <div className="video-container">
          <video
            ref={videoRef}
            controls
            playsInline
            className="anime-frame"
            crossOrigin="anonymous"
            autoPlay
            aria-hidden="true"
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
            <div className="video-option-container">
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
              <button
                onClick={() => {
                  changeEpisodeBy(-1);
                }}
                className="go-prev option-change-episode"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  changeEpisodeBy(1);
                }}
                className="option-change-episode"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </>
    );
  } else {
    return (
      <div>
        <h2 className="loading">currently loading your video..</h2>
      </div>
    );
  }
}

export default VideoFrame;
