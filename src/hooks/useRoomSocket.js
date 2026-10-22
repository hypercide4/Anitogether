import { useEffect, useState, useRef, useCallback } from "react";

export default function useRoomSocket({
  videoRef,
  MALidRef,
  epNumRef,
  uuid,
  isAutoSyncRef,
}) {
  const [users, setUsers] = useState([]);
  const [messages, setMessagesBox] = useState([]);
  const socketRef = useRef(null);

  const sendOverWebsocket = useCallback((messagePayload) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(messagePayload));
    }
  }, []);
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
              videoElement.currentTime < incomingData.time + 20
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

  return {
    users,
    setUsers,
    messages,
    sendOverWebsocket,
  };
}
