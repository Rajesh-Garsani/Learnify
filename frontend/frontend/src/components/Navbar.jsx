import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar as BootstrapNavbar, Container, Nav, NavDropdown, Button, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../axiosConfig';
import '../index.css';

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  const categoriesScrollRef = useRef(null);
  const coursesScrollRef = useRef(null);
  const profileRef = useRef(null);

  const [showCategoriesLeft, setShowCategoriesLeft] = useState(false);
  const [showCategoriesRight, setShowCategoriesRight] = useState(false);
  const [showCoursesLeft, setShowCoursesLeft] = useState(false);
  const [showCoursesRight, setShowCoursesRight] = useState(false);

  const universalArray = (data) =>
    Array.isArray(data)
      ? data
      : Array.isArray(data?.results) ? data.results
      : Array.isArray(data?.categories) ? data.categories
      : Array.isArray(data?.data) ? data.data
      : [];

  const checkUserLogin = () => {
    const u = localStorage.getItem('user');
    if (u) {
      try { setUser(JSON.parse(u)); } catch (e) { setUser(null); }
    } else {
      setUser(null);
    }
  };

  const updateScrollArrows = useCallback((ref, setLeft, setRight) => {
    const el = ref.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth;
    if (!hasOverflow) {
      setLeft(false);
      setRight(false);
      return;
    }
    setLeft(el.scrollLeft > 0);
    setRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const categoriesEl = categoriesScrollRef.current;
    const coursesEl = coursesScrollRef.current;
    const handleCategoriesScroll = () => updateScrollArrows(categoriesScrollRef, setShowCategoriesLeft, setShowCategoriesRight);
    const handleCoursesScroll = () => updateScrollArrows(coursesScrollRef, setShowCoursesLeft, setShowCoursesRight);

    updateScrollArrows(categoriesScrollRef, setShowCategoriesLeft, setShowCategoriesRight);
    updateScrollArrows(coursesScrollRef, setShowCoursesLeft, setShowCoursesRight);

    categoriesEl?.addEventListener('scroll', handleCategoriesScroll);
    coursesEl?.addEventListener('scroll', handleCoursesScroll);
    window.addEventListener('resize', () => {
      updateScrollArrows(categoriesScrollRef, setShowCategoriesLeft, setShowCategoriesRight);
      updateScrollArrows(coursesScrollRef, setShowCoursesLeft, setShowCoursesRight);
    });

    return () => {
      categoriesEl?.removeEventListener('scroll', handleCategoriesScroll);
      coursesEl?.removeEventListener('scroll', handleCoursesScroll);
      window.removeEventListener('resize', () => {});
    };
  }, [categories, courses, updateScrollArrows]);

  useEffect(() => {
    setExpanded(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
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

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/');
      setCategories(universalArray(res.data));
    } catch {
      setCategories([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses/');
      setCourses(universalArray(res.data));
    } catch {
      setCourses([]);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      searchInputRef.current?.blur();
    } else {
      navigate('/search');
    }
  };

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky-top">
      {/* ---- TOP NAVBAR ---- */}
      <BootstrapNavbar expand="lg" className="glass-navbar" expanded={expanded} onToggle={setExpanded}>
        <Container fluid className="d-flex align-items-center flex-nowrap">
          <Link to="/" className="home-icon me-2 flex-shrink-0">
            <i className="bi bi-house-door-fill"></i>
          </Link>

          {categories.length > 0 && (
            <div className="scrollable-strip d-none d-lg-flex">
              {showCategoriesLeft && (
                <button className="scroll-arrow" onClick={() => scrollContainer(categoriesScrollRef, 'left')} aria-label="Scroll left">
                  <i className="bi bi-chevron-left"></i>
                </button>
              )}
              <div className={`scrollable-items ${showCategoriesLeft || showCategoriesRight ? 'overflowing' : ''}`} ref={categoriesScrollRef}>
                {categories.map(cat => (
                  <Link to={`/category/${cat.id}`} key={cat.id} className="category-chip">
                    {cat.name}
                  </Link>
                ))}
              </div>
              {showCategoriesRight && (
                <button className="scroll-arrow" onClick={() => scrollContainer(categoriesScrollRef, 'right')} aria-label="Scroll right">
                  <i className="bi bi-chevron-right"></i>
                </button>
              )}
            </div>
          )}

          <Form onSubmit={handleSearch} className="search-form ms-auto me-2">
            <InputGroup size="sm">
              <InputGroup.Text className="search-icon"><i className="bi bi-search"></i></InputGroup.Text>
              <Form.Control
                ref={searchInputRef}
                type="search..."
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </Form>

          <div className="profile-container flex-shrink-0" ref={profileRef}>
            <button
              className="profile-toggle-btn"
              onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
              aria-expanded={profileOpen}
            >
              {user ? (
                <div className="avatar-circle">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="avatar-circle-guest">
                  <i className="bi bi-person-fill"></i>
                </div>
              )}
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {user ? (
                  <>
                    <div className="dropdown-header">
                      <p className="user-name">{user.username}</p>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setProfileOpen(false)}>
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </>
                ) : (
                  <div className="guest-menu">
                    <Button as={Link} to="/login" variant="primary" onClick={() => setProfileOpen(false)}>Log in</Button>
                    <Button as={Link} to="/signup" variant="primary" onClick={() => setProfileOpen(false)}>Sign Up</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <BootstrapNavbar.Toggle aria-controls="navbar-mobile" className="border-0 shadow-none ms-2 d-lg-none" />
        </Container>

        <BootstrapNavbar.Collapse id="navbar-mobile">
          <Nav className="d-lg-none mt-2">
            <NavDropdown title="Categories" id="mobile-categories-dropdown">
              {categories
                .filter(cat => !['categories', 'category'].includes(cat.name.toLowerCase()))
                .map(cat => (
                  <NavDropdown.Item as={Link} to={`/category/${cat.id}`} key={cat.id}>
                    {cat.name}
                  </NavDropdown.Item>
                ))}
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/categories">
                View All Categories
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BootstrapNavbar.Collapse>
      </BootstrapNavbar>

      {/* ---- SECOND NAVBAR: Courses ---- */}
      {courses.length > 0 && (
        <div className="courses-bar border-top">
          <Container fluid className="d-flex justify-content-center">
            <div className="scrollable-strip">
              {showCoursesLeft && (
                <button className="scroll-arrow" onClick={() => scrollContainer(coursesScrollRef, 'left')} aria-label="Scroll left">
                  <i className="bi bi-chevron-left"></i>
                </button>
              )}
              <div className={`scrollable-items ${showCoursesLeft || showCoursesRight ? 'overflowing' : ''}`} ref={coursesScrollRef}>
                {courses.map(course => (
                  <Link to={`/course/${course.id}`} key={course.id} className="course-chip">
                    {course.title}
                  </Link>
                ))}
              </div>
              {showCoursesRight && (
                <button className="scroll-arrow" onClick={() => scrollContainer(coursesScrollRef, 'right')} aria-label="Scroll right">
                  <i className="bi bi-chevron-right"></i>
                </button>
              )}
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}

export default Navbar;
