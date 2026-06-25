import React, { useState, useEffect, useRef } from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, NavDropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "../index.css";

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  const universalArray = (data) =>
    Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : Array.isArray(data?.categories) ? data.categories : Array.isArray(data?.data) ? data.data : [];

  const checkUserLogin = () => {
    const u = localStorage.getItem("user");
    if (u) {
      try { setUser(JSON.parse(u)); } catch (e) { setUser(null); }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    checkUserLogin();
    window.addEventListener('storage', checkUserLogin);

    const handleKeyDown = (e) => {
      if ((e.key === 'q' || e.key === 'Q' || e.key === '/') &&
          document.activeElement.tagName !== 'INPUT' &&
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (window.location.pathname !== '/search') {
          navigate('/search');
        } else {
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('storage', checkUserLogin);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

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
      searchInputRef.current?.blur();
    } else {
      navigate('/search');
      setExpanded(false);
    }
  };

  return (
    <BootstrapNavbar
      expand="lg"
      className="sticky-top glass-navbar"
      expanded={expanded}
      onToggle={(expanded) => setExpanded(expanded)}
    >
      <Container>
        {/* Brand Logo */}
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <i className="bi bi-braces fs-3" style={{ color: 'var(--brand-primary)' }}></i>
          <span className="fw-bold" style={{
            background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem',
            letterSpacing: '-0.5px'
          }}>
            Learnify
          </span>
        </BootstrapNavbar.Brand>

        {/* Mobile Toggle */}
        <BootstrapNavbar.Toggle aria-controls="navbar-nav" className="border-0 shadow-none" />

        <BootstrapNavbar.Collapse id="navbar-nav">
          {/* Main Navigation */}
          <Nav className="mx-auto align-items-lg-center">
            <Nav.Link as={Link} to="/" className="px-3 fw-medium text-muted">Home</Nav.Link>

            {/* Categories Dropdown */}
            <NavDropdown title="Categories" id="categories-dropdown" className="px-2 fw-medium text-muted">

              {categories.length > 0 ? (
                categories.map(c => (
                  <NavDropdown.Item as={Link} to={`/category/${c.id}`} key={c.id} className="py-2 text-muted fw-medium">
                    {c.name}
                  </NavDropdown.Item>
                ))
              ) : (
                <NavDropdown.Item disabled>Loading...</NavDropdown.Item>
              )}


            </NavDropdown>

            <Nav.Link as={Link} to="/courses" className="px-3 fw-medium text-muted">Courses</Nav.Link>
            <Nav.Link as={Link} to="/about" className="px-3 fw-medium text-muted">About</Nav.Link>
          </Nav>

          {/* Search Bar */}
          <div className="d-flex align-items-center mx-lg-3 my-3 my-lg-0">
            <Form onSubmit={handleSearch} className="w-100">
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0 ps-0 shadow-none bg-white"
                />
              </InputGroup>
            </Form>
          </div>

          {/* User Actions */}
          <Nav className="align-items-lg-center">
            {user ? (
              /* LOGGED IN USER DROPDOWN */
              <NavDropdown
                title={
                  <div className="avatar-circle">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                }
                id="user-dropdown"
                align="end"
                className="no-caret mt-2 mt-lg-0"
              >
                <div className="px-4 py-3 border-bottom mb-2">
                  <p className="mb-0 fw-bold text-dark">{user.username}</p>
                  <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '180px' }}>{user.email}</p>
                </div>
                <NavDropdown.Item as={Link} to="/profile" className="py-2 text-muted fw-medium">
                  <i className="bi bi-person me-2"></i> My Profile
                </NavDropdown.Item>


                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} className="py-2 text-danger fw-medium">
                  <i className="bi bi-box-arrow-right me-2"></i> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              /* GUEST / LOGGED OUT DROPDOWN */
              <NavDropdown
                title={
                  <div className="avatar-circle-guest">
                    <i className="bi bi-person-fill"></i>
                  </div>
                }
                id="guest-dropdown"
                align="end"
                className="no-caret mt-2 mt-lg-0"
              >
                <div className="px-4 py-3 text-center" style={{ minWidth: '220px' }}>

                  <Button as={Link} to="/login" variant="primary" className="w-100 mb-2 py-2" onClick={() => setExpanded(false)}>
                    Log in
                  </Button>
                  <Button as={Link} to="/signup" variant="primary" className="w-100 py-2" onClick={() => setExpanded(false)}>
                    Sign Up
                  </Button>
                </div>
              </NavDropdown>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;