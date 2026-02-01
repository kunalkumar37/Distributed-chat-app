import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function App() {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
const stompClientRef = useRef(null);

  const username = "user1";   // change in second window to user2
  const receiver = "user2";

  useEffect(() => {

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
      connectHeaders: {
        username: username
      },
      debug: str => console.log(str),
      onConnect: () => {
        console.log("Connected!");

        client.subscribe(
          "/user/queue/messages",
          message => {
            setMessages(prev => [...prev, JSON.parse(message.body)]);
          }
        );
      }
    });

    client.activate();
  }, []);

  const sendMessage = () => {
    if (!text) return;

    const client = stompClientRef.current;

    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        sender: username,
        receiver: receiver,
        content: text,
        timestamp: new Date()
      })
    });

    setText("");
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Realtime Chat</h2>

      {messages.map((m, i) => (
        <div key={i}><b>{m.sender}:</b> {m.content}</div>
      ))}

      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type message"
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
