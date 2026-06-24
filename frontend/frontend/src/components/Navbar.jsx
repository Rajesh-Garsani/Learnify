import React, { useState, useEffect, useRef } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../App.css";

function Navbar() {
  const universalArray = (data) =>
    Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : Array.isArray(data?.categories)
      ? data.categories
      : Array.isArray(data?.data)
      ? data.data
      : [];

  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  // Check user login status
  const checkUserLogin = () => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    checkUserLogin();

    window.addEventListener('storage', checkUserLogin);

    // Add global keyboard shortcut for 'Q' key
    const handleKeyDown = (e) => {
      // Check for 'Q' key or '/' key
      if ((e.key === 'q' || e.key === 'Q' || e.key === '/') &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA' &&
          document.activeElement.tagName !== 'SELECT' &&
          !document.activeElement.contentEditable) {
        e.preventDefault();

        // If we're not already on the search page, navigate to it
        if (window.location.pathname !== '/search') {
          navigate('/search');
        } else {
          // If already on search page, focus the input
          const searchInput = document.getElementById('main-search-input');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('storage', checkUserLogin);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/categories/');
      setCategories(universalArray(res.data));
    } catch {
      setCategories([]);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setExpanded(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setExpanded(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setExpanded(false);
    } else {
      // If search input is empty, navigate to search page anyway
      navigate('/search');
      setExpanded(false);
    }
  };

  return (
    <BootstrapNavbar
      expand="lg"
      className="sticky-top slim-navbar shadow-sm"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
      style={{ minHeight: '60px' }}
    >
      <Container fluid="lg" className="align-items-center py-0">
        {/* Brand Logo */}
        <BootstrapNavbar.Brand as={Link} to="/" className="py-0">
          <span className="fw-bold" style={{
            background: 'linear-gradient(45deg, #2c5282, #4a90e2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.4rem',
            letterSpacing: '-0.5px'
          }}>
            LearnAI
          </span>
        </BootstrapNavbar.Brand>

        {/* Mobile Toggle */}
        <BootstrapNavbar.Toggle
          aria-controls="navbar-nav"
          className="border-0 p-1"
          style={{ fontSize: '0.9rem' }}
        >
          <span className="navbar-toggler-icon"></span>
        </BootstrapNavbar.Toggle>

        <BootstrapNavbar.Collapse id="navbar-nav">
          {/* Main Navigation */}
          <Nav className="mx-auto d-flex align-items-center">
            <Nav.Link
              as={Link}
              to="/"
              className="nav-link-slim px-3"
              onClick={() => setExpanded(false)}
            >
              Home
            </Nav.Link>

            {/* Categories Dropdown */}
            <NavDropdown
              title="Categories"
              id="categories-dropdown"
              className="nav-dropdown-slim px-3"
              style={{ padding: '0' }}
            >
              <div className="dropdown-header-slim">
                <small className="text-uppercase">Browse Topics</small>
              </div>
              {categories.length > 0 ? (
                categories.map(c => (
                  <NavDropdown.Item
                    as={Link}
                    to={`/category/${c.id}`}
                    key={c.id}
                    className="dropdown-item-slim"
                    onClick={() => setExpanded(false)}
                  >
                    {c.name}
                  </NavDropdown.Item>
                ))
              ) : (
                <NavDropdown.Item disabled className="text-muted">
                  Loading...
                </NavDropdown.Item>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item
                as={Link}
                to="/categories"
                className="dropdown-item-slim fw-bold"
                onClick={() => setExpanded(false)}
              >
                View All Categories
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link
              as={Link}
              to="/courses"
              className="nav-link-slim px-3"
              onClick={() => setExpanded(false)}
            >
              Courses
            </Nav.Link>

            <Nav.Link
              as={Link}
              to="/about"
              className="nav-link-slim px-3"
              onClick={() => setExpanded(false)}
            >
              About
            </Nav.Link>
          </Nav>

          {/* Search Bar with Icon */}
          <div className="search-container-slim mx-lg-3 mb-2 mb-lg-0">
            <Form className="d-flex" onSubmit={handleSearch}>
              <InputGroup className="search-input-group">
                <Form.Control
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search (Press Q)..."
                  className="search-input"
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.375rem 0.75rem',
                    height: '36px',
                    borderColor: '#e0e0e0'
                  }}
                />
                <Button
                  variant="outline-secondary"
                  type="submit"
                  className="search-button"
                  style={{
                    height: '36px',
                    padding: '0 0.75rem',
                    borderColor: '#e0e0e0',
                    borderLeft: 'none'
                  }}
                  onClick={handleSearchClick}
                >
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Form>
          </div>

          {/* User Actions */}
          <Nav className="ms-lg-auto d-flex align-items-center">
            {user ? (
              <NavDropdown
                title={
                  <span className="d-flex align-items-center user-dropdown-slim">
                    <span className="user-avatar-mini me-1">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                    <span className="me-1" style={{ fontSize: '0.9rem' }}>{user.username}</span>
                  </span>
                }
                id="user-dropdown"
                align="end"
                className="nav-dropdown-slim"
              >
                <div className="dropdown-header-slim">
                  <div className="d-flex align-items-center">
                    <div className="user-avatar-slim me-2">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem' }}>{user.username}</div>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                </div>
                <NavDropdown.Item
                  as={Link}
                  to="/profile"
                  className="dropdown-item-slim"
                  onClick={() => setExpanded(false)}
                >
                  <i className="bi bi-person-circle me-2"></i>
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Item
                  as={Link}
                  to="/dashboard"
                  className="dropdown-item-slim"
                  onClick={() => setExpanded(false)}
                >
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </NavDropdown.Item>
                <NavDropdown.Item
                  as={Link}
                  to="/settings"
                  className="dropdown-item-slim"
                  onClick={() => setExpanded(false)}
                >
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item
                  onClick={logout}
                  className="dropdown-item-slim text-danger"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-primary"
                  className="btn-slim px-3"
                  onClick={() => setExpanded(false)}
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/signup"
                  variant="primary"
                  className="btn-slim px-3"
                  onClick={() => setExpanded(false)}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;