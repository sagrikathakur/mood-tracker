import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Tracker from "./Pages/Tracker";
import AnxietyCalmGame from "./Pages/AnxietyCalmGame";
import ChatFriend from "./Pages/ChatFriend";
import GoogleMeet from "./Pages/GoogleMeet";
import ProtectedRoute from "./Components/ProtectedRoute";

const App = () => {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        {/* Public Landing, About Me & Contact */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/game" element={<AnxietyCalmGame />} />
        <Route path="/game/*" element={<AnxietyCalmGame />} />
        <Route path="/anxiety-game" element={<AnxietyCalmGame />} />
        <Route path="/anxiety-game/*" element={<AnxietyCalmGame />} />
        <Route path="/chatafriend" element={<ChatFriend />} />
        <Route path="/chat-friend" element={<ChatFriend />} />
        <Route path="/meet" element={<GoogleMeet />} />
        <Route path="/meet/:roomParam" element={<GoogleMeet />} />
        <Route path="/googlemeet" element={<GoogleMeet />} />
        <Route path="/google-meet" element={<GoogleMeet />} />

        {/* Protected App Routes */}
        <Route
          path="/tracker"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/wellness"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-mails"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          }
        />

        {/* Auth Page */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;
