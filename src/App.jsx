import { useRef, useState } from "react";
import AnimePicker from "./components/animesearch/AnimePicker";
import useRoomSocket from "./hooks/useRoomSocket";
import LiveChat from "./components/chat/LiveChat";
import VideoFrame from "./components/player/VideoFrame";
import ParticipantList from "./components/room/ParticipantList";
import getServer from "./services/serverapi";

import { v4 as uuidv4 } from "uuid";
const uuid = uuidv4();

function App() {
  const videoRef = useRef(null);
  const isAutoSyncRef = useRef(false);
  const [url, setUrl] = useState(null);
  const [subs, setSubs] = useState(null);
  const [username, setUsername] = useState("default");
  const [epNum, setEpNum] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const MALidRef = useRef(0);
  const epNumRef = useRef(0);

  const { users, setUsers, messages, sendOverWebsocket } = useRoomSocket({
    videoRef,
    MALidRef,
    epNumRef,
    isAutoSyncRef,
    uuid,
  });

  async function fetchEpisode(selectedId, epNum) {
    setShowChat(true);
    const payload = await getServer(selectedId, epNum);
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
        <ParticipantList showChat={showChat} users={users} uuid={uuid} />
        {showChat && (
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
          />
        )}
        {showChat && (
          <>
            <LiveChat
              username={username}
              messages={messages}
              sendOverWebsocket={sendOverWebsocket}
              MALidRef={MALidRef}
              epNumRef={epNumRef}
              uuid={uuid}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
