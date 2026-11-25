import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Auth from './pages/Auth/Auth';
import Dashboard from './pages/Dashboard/Dashboard';
import MyQuestions from './pages/MyQuestions/MyQuestions';
import Landing from './pages/Landing/Landing';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes */}
          <Route>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questions/ask"
              element={
                <ProtectedRoute>
                  <h1>Ask a Question Page</h1>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-questions"
              element={
                <ProtectedRoute>
                  <MyQuestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/question/:id"
              element={
                <ProtectedRoute>
                  <h1>Question Detail Page</h1>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rag-documents"
              element={
                <ProtectedRoute>
                  <h1>RAG Documents Page</h1>
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
