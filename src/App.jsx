import { useRef, useState } from "react";
import AnimePicker from "./components/animesearch/AnimePicker";
import useRoomSocket from "./hooks/useRoomSocket";
import LiveChat from "./components/chat/LiveChat";
import VideoFrame from "./components/player/VideoFrame";
import ParticipantList from "./components/room/ParticipantList";
import getServer from "./services/serverapi";
import "./globals.css";

import { v4 as uuidv4 } from "uuid";
const uuid = uuidv4();

function App() {
  const videoRef = useRef(null);
  const isAutoSyncRef = useRef(false); // used to prevent code spamming pause and play
  const [url, setUrl] = useState(null);
  const [subs, setSubs] = useState(null);
  const [username, setUsername] = useState("default");
  const [epNum, setEpNum] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); // still didn't implement this feature
  const MALidRef = useRef(0);
  const epNumRef = useRef(0);

  const { users, setUsers, messages, sendOverWebsocket } = useRoomSocket({
    //turn on websocket so the browsers talk to the backend and enable chat and syncing
    videoRef,
    isAutoSyncRef,
    uuid,
    setIsBuffering,
  });

  async function fetchEpisode(selectedId, epNum) {
    setLoading(true);
    const payload = await getServer(selectedId, epNum).catch((error) => {
      setLoading(false);
      console.error("video didn't load, error: ", error);
      return;
    });
    setLoading(false);
    setShowChat(true);
    setUsers([]);
    setUrl(payload.src);
    setSubs(payload.subs);
  }

  return (
    <div className="app-container">
      <AnimePicker
        epNum={epNum}
        selectedId={selectedId}
        MALidRef={MALidRef}
        epNumRef={epNumRef}
        setEpNum={setEpNum}
        setSelectedId={setSelectedId}
        setUsername={setUsername}
        fetchEpisode={fetchEpisode}
      />
      <div className="video-chat-container">
        <ParticipantList users={users} uuid={uuid} isBuffering={isBuffering} />
        <VideoFrame
          src={url}
          subs={subs}
          sendOverWebsocket={sendOverWebsocket}
          videoRef={videoRef}
          username={username}
          MALidRef={MALidRef}
          epNumRef={epNumRef}
          setEpNum={setEpNum}
          epNum={epNum}
          isAutoSyncRef={isAutoSyncRef}
          uuid={uuid}
          selectedId={selectedId}
          fetchEpisode={fetchEpisode}
          loading={loading}
        />
        <LiveChat
          username={username}
          messages={messages}
          sendOverWebsocket={sendOverWebsocket}
          MALidRef={MALidRef}
          epNumRef={epNumRef}
          uuid={uuid}
          showChat={showChat}
        />
      </div>
    </div>
  );
}

export default App;
