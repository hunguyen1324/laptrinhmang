import React, { useState } from "react";

export default function Login({ socket, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      return;
    }
    socket.emit("login", { username, password });
  };

  socket.on("login_status", (data) => {
    if (data.status === "success") {
      onLoginSuccess();
    }
  });

  return (
    <div>
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
    </div>
  );
}