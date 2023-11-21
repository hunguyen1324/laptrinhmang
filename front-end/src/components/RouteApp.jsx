import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import ChatRoom from './ChatRoom';

function AppRoutes({ socket }) {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/login'); // Navigate to the '/login' route
  };

  const handleLoginSuccess = () => {
    navigate('/chatroom'); // Navigate to the '/chatroom' route
  };

  return (
    <Routes>
      <Route path="/register" element={<Register socket={socket} onRegisterSuccess={handleRegisterSuccess} />} />
      <Route path="/login" element={<Login socket={socket} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/chatroom" element={<ChatRoom socket={socket} />} />
    </Routes>
  );
}

export default function App({ socket }) {
  return (
    <Router>
      <AppRoutes socket={socket} />
    </Router>
  );
}