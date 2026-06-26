import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import "./axiosConfig";
import AllCategories from './pages/AllCategories';
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

// ⭐ NEW IMPORTS (Only Footer and DynamicPage now!)
import DynamicPage from './pages/DynamicPage';
import Footer from './components/Footer';

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
      {/* Added d-flex flex-column min-vh-100 so footer sticks to bottom */}
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />

        {/* flex-grow-1 makes the main content take up remaining screen space */}
        <main className="flex-grow-1" style={{ position: 'relative' }}>
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
            <Route path="/courses" element={<Courses />} />
            <Route path="/categories" element={<AllCategories />} />
            {/* ⭐ DYNAMIC LEGAL ROUTES (Managed via Django Admin) */}
            <Route path="/about" element={<DynamicPage slug="about" />} />
            <Route path="/privacy" element={<DynamicPage slug="privacy" />} />
            <Route path="/terms" element={<DynamicPage slug="terms" />} />

            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <AIChatbot />

        <Footer />

      </div>
    </Router>
  );
}

export default App;