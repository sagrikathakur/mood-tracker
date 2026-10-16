import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Tracker from "./Pages/Tracker";
import ProtectedRoute from "./Components/ProtectedRoute";

const App = () => {
  return (
    <div className="w-full min-h-screen">
      <Routes>
        {/* Public Landing (adaptive for guests & members) */}
        <Route path="/" element={<Home />} />

        {/* Strictly Protected Routes - Requires Login */}
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

        {/* Auth Page */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
};

export default App;