import { useState, useRef, useEffect } from "react";
import "./LiveChat.css";

function LiveChat({ username, messages, sendOverWebsocket, MALidRef, epNumRef}) {
  const [inputText, setInputText] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef) {
      const container = chatContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  function handleKeyPress(e) {
    if (e.key === "Enter" && e.target.value.length > 0) {
      const messagePayload = {
        type: "message",
        MALid: MALidRef.current,
        epNum: epNumRef.current,
        username: username,
        content: e.target.value,
        time: null,
        action: null,
      };

      sendOverWebsocket(messagePayload);

      setInputText("");
    }
  }
  function handleInput(e) {
    setInputText(e.target.value);
  }

  return (
    <>
      <div className="chat-container">
        <div className="messages" ref={chatContainerRef}>
          {messages.length > 0 &&
            messages.map((message, index) => {
              const isSameUserAsBefore =
                index > 0 && messages[index - 1].username === message.username;

              return (
                <div className="message" key={index}>
                  {!isSameUserAsBefore && (
                    <div className="message-username">
                      <p>
                        <strong>{message.username}</strong>
                      </p>
                    </div>
                  )}
                  <div className="message-content">
                    <p> {message.content} </p>
                  </div>
                </div>
              );
            })}
          <div />
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Send a message here!"
            value={inputText}
            onKeyDown={handleKeyPress}
            onChange={handleInput}
          />
        </div>
      </div>
    </>
  );
}

export default LiveChat;
