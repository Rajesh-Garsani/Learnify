import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import "./axiosConfig";

import Navbar from './components/Navbar';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import TopicDetail from './pages/TopicDetail';
import SubCategoryPage from './pages/SubCategoryPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from "./pages/Profile";
import AIChatbot from './components/AIChatbot';
import SearchPage from './components/SearchPage';
import Courses from './pages/Courses';


// BUG 5 FIX: Added a ProtectedRoute wrapper to stop sudden logouts on browser refresh
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <main style={{ position: 'relative', minHeight: '80vh' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/topic/:topicId" element={<TopicDetail />} />
            <Route path="/subcategory/:subcategoryId" element={<SubCategoryPage />} />
            <Route path="/category/:categoryId" element={<SubCategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            {/* 2. Add this exact route */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetail />} />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <AIChatbot />

      </div>
    </Router>
  );
}

export default App;