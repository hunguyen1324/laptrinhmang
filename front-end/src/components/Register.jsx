import React, { useState } from "react";

export default function Register({ socket, onRegisterSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!username || !password) {
      return;
    }
    socket.emit("register", { username, password });
  };

  socket.on("register_status", (data) => {
    if (data.status === "success") {
      onRegisterSuccess();
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
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}