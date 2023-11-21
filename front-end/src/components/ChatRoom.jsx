import React, { useState, useEffect } from "react";

export default function ChatRoom({ socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");

  const handleText = (e) => {
    const inputMessage = e.target.value;
    setMessage(inputMessage);
  };

  const handleSubmit = () => {
    if (!message) {
      return;
    }
    socket.emit("data", message);
    setMessage("");
  };

  const handleJoinRoom = () => {
    if (!room) {
      return;
    }
    socket.emit("join", { room });
  };

  const handleLogout = () => {
    socket.emit("logout");
  };

  useEffect(() => {
    socket.on("data", (data) => {
      setMessages([...messages, data.data]);
    });

    socket.on("joined", (data) => {
      console.log(data);
    });

    return () => {
      socket.off("data");
      socket.off("joined");
    };
  }, [socket, messages]);

  return (
    <div>
      <h2>WebSocket Communication</h2>
      <button onClick={handleLogout}>Logout</button>
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room name"
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      <input type="text" value={message} onChange={handleText} />
      <button onClick={handleSubmit}>Submit</button>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}