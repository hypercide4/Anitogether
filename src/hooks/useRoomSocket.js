import { useEffect, useState, useRef, useCallback } from "react";

export default function useRoomSocket({
  videoRef,

  uuid,
  isAutoSyncRef,
  setIsBuffering,
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
    const ws = new WebSocket("wss://backend-xte1.onrender.com/ws");
    socketRef.current = ws;
    ws.onopen = () => {
      if (socketRef.current) {
        console.log("websocket connection opened");
      }
    };

    ws.onmessage = (event) => {
      try {
        const videoElement = videoRef.current;
        const incomingData = JSON.parse(event.data); // turn it back from a string into a dictionary

        if (
          incomingData.type === "message" ||
          incomingData.type === "messageAdmin"
        ) {
          setMessagesBox((prev) => [...prev, incomingData]);
          return;
        }

        setUsers((prev) => {
          const otherId = incomingData.id;
          if (!otherId) return prev; // if there is no id in the incoming data, return early
          const exists = prev.some((user) => user.id === otherId); // check if the user is already in the user array
          if (exists) {
            // if the user in the array: update their time, else keep the user unchanged (used to show everyone's time)
            return prev.map((user) =>
              user.id === otherId ? { ...user, time: incomingData.time } : user,
            );
          }
          // if they aren't in the array, put them in the array
          return [
            ...prev,
            {
              username: incomingData.username,
              time: incomingData.time,
              id: otherId,
            },
          ];
        });

        if (incomingData.type === "sync") {
          if (
            incomingData.action === "pause" &&
            !videoElement.paused &&
            incomingData.id !== uuid
          ) {
            isAutoSyncRef.current = true;
            videoElement.pause();
          } else if (
            incomingData.action === "play" &&
            videoElement.paused &&
            incomingData.id !== uuid
          ) {
            isAutoSyncRef.current = true;
            videoElement.play().catch((error) => {
              console.error(error);
              isAutoSyncRef.current = false;
            });
          } else if (incomingData.action === "buffer") {
            setIsBuffering(true);
          } else if (
            incomingData.action === "timeupdate" &&
            incomingData.id === uuid
          ) {
            setIsBuffering(false);
          } else if (
            incomingData.action === "timeupdate" &&
            incomingData.id !== uuid
          ) {
            const timeDifference = videoElement.currentTime - incomingData.time;
            // positive means you are ahead
            if (timeDifference > 5 && timeDifference < 20) {
              // if you are ahead of someone by 5-20 seconds, go back to their time
              videoElement.currentTime = incomingData.time;
            } else if (timeDifference < -16) {
              // if someone is ahead of you by more than 16 seconds, go to their time
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
