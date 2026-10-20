import { useState, useEffect, useRef } from "react";
import searchAnime from "../../services/searchapi";
import "./AnimePicker.css";
import getserver from "../../services/serverapi";
import LiveChat from "../LiveChat/LiveChat";
import VideoFrame from "../VideoFrame/VideoFrame";
import { v4 as uuidv4 } from "uuid";
const uuid = uuidv4();
let wasloadingclose = true;

function AnimePicker() {
  const videoRef = useRef(null);
  const userRef = useRef(null);
  const isAutoSyncRef = useRef(false);
  const [users, setUsers] = useState([]);
  const [url, setUrl] = useState(null);
  const [subs, setSubs] = useState(null);
  const [username, setUsername] = useState("default");
  const [epNum, setEpNum] = useState("");
  const [messages, setMessagesBox] = useState([]);
  const [search, setSearch] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const MALidRef = useRef(0);
  const epNumRef = useRef(0);

  const socketRef = useRef(null);

  function sendOverWebsocket(messagePayload) {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
    }
  }

  useEffect(() => {
    if (!searchText.trim()) return;
    const timer = setTimeout(async () => {
      const results = await searchAnime(searchText);
      setSearch(results);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const ws = new WebSocket("wss://backend-rge1.onrender.com/ws");
    socketRef.current = ws;
    ws.onopen = () => {
      if (socketRef.current) {
        console.log("websocket connection opened");
      }
    };

    ws.onmessage = (event) => {
      try {
        const videoElement = videoRef.current;
        const incomingData = JSON.parse(event.data);

        if (incomingData.type === "messageAdmin") {
          setMessagesBox((prev) => [...prev, incomingData]);
          return;
        }

        if (
          MALidRef.current != incomingData.MALid ||
          epNumRef.current != incomingData.epNum
        )
          return;

        if (incomingData.type === "message") {
          setMessagesBox((prev) => [...prev, incomingData]);
          return;
        }

        setUsers((prev) => {
          const otherid = incomingData.id;
          if (!otherid) return prev;
          const exists = prev.some((user) => user.id === otherid);
          if (exists) {
            return prev.map((user) =>
              user.id === otherid ? { ...user, time: incomingData.time } : user,
            );
          }
          return [
            ...prev,
            {
              username: incomingData.username,
              time: incomingData.time,
              id: otherid,
            },
          ];
        });

        if (incomingData.type === "sync") {
          if (incomingData.id === uuid) {
            return;
          }
          if (incomingData.action === "pause" && !videoElement.paused) {
            isAutoSyncRef.current = true;
            videoElement.pause();
          } else if (incomingData.action === "play" && videoElement.paused) {
            isAutoSyncRef.current = true;
            videoElement.play().catch((error) => {
              console.error(error);
              isAutoSyncRef.current = false;
            });
          } else if (
            incomingData.action === "timeupdate" &&
            incomingData.id !== uuid
          ) {
            if (
              videoElement.currentTime > incomingData.time + 5 &&
              videoElement.currentTime < incomingData.time + 16
            ) {
              videoElement.currentTime = incomingData.time;
            } else if (videoElement.currentTime < incomingData.time - 16) {
              videoElement.currentTime = incomingData.time;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    ws.onclose = () => {
      if (wasloadingclose) {
        wasloadingclose = false;
        return;
      }
      console.log("websocket connection closed");
      setUsers((prev) => prev.filter((user) => user.id !== uuid));
    };
    ws.onerror = (error) => {
      console.error("websocket error: ", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <>
      <div className="input-container">
        <div>
          <input
            type="text"
            className="input-box"
            placeholder="username"
            onChange={(e) => {
              setUsername(e.target.value);
              userRef.current = e.target.value;
            }}
          />
          <input
            type="text"
            className="input-box"
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            placeholder="search"
          />
          <input
            type="text"
            className="input-box"
            placeholder="ep"
            onChange={(e) => {
              setEpNum(e.target.value);
              epNumRef.current = e.target.value;
            }}
          />
          <button
            className="input-button"
            onClick={async () => {
              setShowChat(true);
              setUsers([]);
              const payload = await getserver(selectedId, epNum);
              setUrl(payload.src);
              setSubs(payload.subs);
            }}
          >
            go
          </button>
        </div>
      </div>
      <div className="search-items">
        {search.map((item) => {
          var clicked = false;
          if (selectedId === item.id) {
            clicked = true;
          }

          return (
            <div
              key={item.id}
              className={clicked ? "search-item-clicked" : "search-item"}
              onClick={() => {
                if (selectedId === item.id) {
                  setSelectedId(null);
                  MALidRef.current = null;
                } else {
                  setSelectedId(item.id);
                  MALidRef.current = item.id;
                }
              }}
            >
              <div className="search-picture">
                <img src={item.image_url} />
              </div>
              <div className="search-name">
                <h2>{item.name}</h2>
              </div>
            </div>
          );
        })}
      </div>
      <div className="video-chat-container">
        <div className="display-time-users">
          {showChat &&
            users?.map((user, index) => {
              const minutes = Math.floor(user.time / 60);
              const seconds = String(Math.floor(user.time % 60)).padStart(
                2,
                "0",
              );

              return (
                <div
                  className="display-time-user"
                  key={`${user.username}-${index}`}
                >
                  <p>
                    {user.username}: {minutes}:{seconds}
                  </p>
                </div>
              );
            })}
        </div>
        <div className="video-container">
          {showChat && (
            <VideoFrame
              src={url}
              subs={subs}
              socketRef={socketRef}
              sendOverWebsocket={sendOverWebsocket}
              videoRef={videoRef}
              username={username}
              MALidRef={MALidRef}
              epNumRef={epNumRef}
              epNum={epNum}
              isAutoSyncRef={isAutoSyncRef}
              uuid={uuid}
            />
          )}
        </div>
        {showChat && (
          <>
            <LiveChat
              username={username}
              messages={messages}
              socketRef={socketRef}
              sendOverWebsocket={sendOverWebsocket}
              MALidRef={MALidRef}
              epNumRef={epNumRef}
              uuid={uuid}
            />
          </>
        )}
      </div>
    </>
  );
}

export default AnimePicker;
