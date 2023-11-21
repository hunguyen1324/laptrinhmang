import React, { useEffect, useState } from "react";

export default function WebSocketCall({ socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  const handleLogin = () => {
    if (!username || !password) {
      return;
    }
    socket.emit("login", { username, password });
  };

  const handleRegister = () => {
    if (!username || !password) {
      return;
    }
    socket.emit("register", { username, password });
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

    socket.on("login_status", (data) => {
      if (data.status === "success") {
        console.log("Login successful!");
        // Additional logic for handling successful login
      } else {
        console.log("Login failed!");
        // Additional logic for handling failed login
      }
    });
    socket.on("logout_status", (data) => {
      if (data.status === "success") {
        console.log("Logout successful!");
        // Additional logic for handling successful logout
      } else {
        console.log("Logout failed!");
        // Additional logic for handling failed logout
      }
    });

    socket.on("register_status", (data) => {
      if (data.status === "success") {
        console.log("Registration successful!");
        // Additional logic for handling successful registration
      } else {
        console.log("Registration failed!");
        // Additional logic for handling failed registration
      }
    });

    return () => {
      socket.off("data");
      socket.off("joined");
      socket.off("login_status");
      socket.off("register_status");
    };
  }, [socket, messages]);

  return (
    <div>
      <h2>WebSocket Communication</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>
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
