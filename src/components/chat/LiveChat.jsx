import { useState, useRef, useEffect } from "react";
import "./LiveChat.css";
import "../../globals.css";
import getEmbLinksIfExist from "../../utils/getEmbLinksIfExist";

function LiveChat({
  username,
  messages,
  sendOverWebsocket,
  MALidRef,
  epNumRef,
  uuid,
  showChat,
}) {
  const [inputText, setInputText] = useState("");
  const chatContainerRef = useRef(null);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const messagePayload = {
        type: "message",
        MALid: MALidRef.current,
        epNum: epNumRef.current,
        username: username,
        content: e.target.value,
        time: null,
        action: null,
        id: uuid,
      };
      sendOverWebsocket(messagePayload);
      setInputText("");
    }
  }
  function handleInput(e) {
    setInputText(e.target.value);
  }
  if (showChat) {
    return (
      <>
        <div className="chat-container">
          <div className="messages" ref={chatContainerRef}>
            {messages.length > 0 &&
              messages.map((message, index) => {
                const isSameUserAsBefore =
                  index > 0 && messages[index - 1].id === message.id;
                const links = getEmbLinksIfExist(message.content);

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
                      <p>
                        {(!message.content.startsWith("https://") ||
                          message.content.trim().includes(" ")) &&
                          message.content}
                      </p>
                      <div className="embed-message-content-container">
                        {links &&
                          links.map((link, idx) => (
                            <img
                              key={idx}
                              src={link}
                              className="embed-message-content"
                            />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            <div />
          </div>
          <div className="chat-input">
            <textarea
              type="text"
              placeholder="message.."
              value={inputText}
              onKeyDown={handleKeyPress}
              onChange={handleInput}
            />
          </div>
        </div>
      </>
    );
  }
}

export default LiveChat;
