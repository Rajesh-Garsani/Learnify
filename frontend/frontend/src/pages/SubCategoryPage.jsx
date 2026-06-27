import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Alert, Breadcrumb, Button, Form, InputGroup } from 'react-bootstrap';
import "../index.css";
import axios from '../axiosConfig';

function SubCategoryPage() {
  const { subcategoryId, categoryId } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    fetchSubcategoryData();
  }, [subcategoryId, categoryId]);

  const fetchCourses = async (subcatId, level = difficulty, sort = sortBy) => {
    setLoading(true);
    setCourses([]);
    setNextUrl(null);
    try {
      let url = `/api/courses/?subcategory=${subcatId}&page_size=100`;
      if (level) url += `&difficulty=${level}`;
      if (sort === 'newest') url += '&ordering=-created_at';
      if (sort === 'rating') url += '&ordering=-rating';

      const res = await axios.get(url);
      const data = res.data;

      if (Array.isArray(data)) {
        setCourses(data);
        setNextUrl(null);
      } else {
        setCourses(data.results || []);
        setNextUrl(data.next || null);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreCourses = async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await axios.get(nextUrl);
      const data = res.data;
      if (Array.isArray(data)) {
        setCourses(prev => [...prev, ...data]);
        setNextUrl(null);
      } else {
        setCourses(prev => [...prev, ...(data.results || [])]);
        setNextUrl(data.next || null);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchSubcategoryData = async () => {
    setLoading(true);
    setError('');

    try {
      let subcatList = [];

      if (subcategoryId) {
        const res = await axios.get(`/api/subcategories/${subcategoryId}/`);
        subcatList = [res.data];
        setSelectedSubcategory(res.data);
      } else if (categoryId) {
        const res = await axios.get(`/api/subcategories/?category=${categoryId}`);
        const list = res.data.results || res.data;
        subcatList = Array.isArray(list) ? list : [];
        setSubcategories(subcatList);

        if (subcatList.length > 0) {
          setSelectedSubcategory(subcatList[0]);
        }
      }

      setSubcategories(subcatList);

      if (subcatList.length > 0) {
        fetchCourses(subcatList[0].id, difficulty, sortBy);
      } else {
        setError("No subcategories found");
        setLoading(false);
      }

    } catch (err) {
      console.error("Error fetching subcategory data:", err);
      setError("Failed to load category data");
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcat) => {
    setSelectedSubcategory(subcat);
    fetchCourses(subcat.id, difficulty, sortBy);
  };

  const handleDifficultyClick = (level) => {
    setDifficulty(level);
    if (selectedSubcategory) {
      fetchCourses(selectedSubcategory.id, level, sortBy);
    }
  };

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortBy(sortValue);
    if (selectedSubcategory) {
      fetchCourses(selectedSubcategory.id, difficulty, sortValue);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#64748b';
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) return (
    <Container className="my-5 py-5 text-center">
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">Loading courses...</p>
    </Container>
  );

  if (error) return (
    <Container className="my-5 py-5 text-center">
      <Alert variant="danger" className="mx-auto" style={{ maxWidth: '600px', borderRadius: '12px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i> {error}
      </Alert>
      <Button as={Link} to="/" className="btn-primary mt-3">
        <i className="bi bi-house me-2"></i> Back to Home
      </Button>
    </Container>
  );

  return (
    <Container className="mt-4 pb-5">
      <Breadcrumb className="mb-4 small fw-medium">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }} className="text-muted">
          <i className="bi bi-house me-1"></i> Home
        </Breadcrumb.Item>
        {selectedSubcategory?.category_name && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/category/${selectedSubcategory.category}` }} className="text-muted">
            {selectedSubcategory.category_name}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active style={{ color: 'var(--brand-primary)' }}>
          {selectedSubcategory?.name}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-5">
        <Col>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
            <div>
              <h1 className="fw-bolder mb-3 display-6 text-dark">{selectedSubcategory?.name}</h1>
              {selectedSubcategory?.description ? (
                <div className="text-muted fs-5 mb-3" dangerouslySetInnerHTML={{ __html: selectedSubcategory.description }} />
              ) : (
                <p className="text-muted fs-5 mb-3">Explore courses in this category</p>
              )}
              <div className="d-flex gap-2">
                <Badge bg="white" text="dark" className="border px-3 py-2 rounded-pill fw-medium shadow-sm">
                  <i className="bi bi-book text-primary me-2"></i>
                  {courses.length}{nextUrl ? '+' : ''} {courses.length === 1 ? 'Course' : 'Courses'}
                </Badge>
                <Badge bg="white" text="dark" className="border px-3 py-2 rounded-pill fw-medium shadow-sm">
                  <i className="bi bi-tags text-primary me-2"></i>{subcategories.length} Subcategories
                </Badge>
              </div>
            </div>

            <div className="w-100" style={{ maxWidth: '250px' }}>
              <Form.Select value={sortBy} onChange={handleSortChange} className="shadow-sm border-0 py-2">
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </Form.Select>
            </div>
          </div>
        </Col>
      </Row>

      {/* ===== MOBILE FILTER BAR (sticky, hidden on lg) ===== */}
      <div className="bg-white p-2 rounded-4 shadow-sm mb-3 d-lg-none sticky-top" style={{ zIndex: 1030, top: '0' }}>
        <div className="d-flex flex-nowrap gap-2 align-items-center">
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <Form.Select
              value={selectedSubcategory?.id || ''}
              onChange={(e) => {
                const subcat = subcategories.find(sc => sc.id === parseInt(e.target.value));
                if (subcat) handleSubcategoryClick(subcat);
              }}
              className="shadow-none rounded-3"
              size="sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            >
              <option value="">Select Topic</option>
              {subcategories.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </Form.Select>
          </div>

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <Form.Select
              value={difficulty}
              onChange={(e) => handleDifficultyClick(e.target.value)}
              className="shadow-none rounded-3"
              size="sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Form.Select>
          </div>

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <Form onSubmit={handleSearch} className="d-flex">
              <Form.Control
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="shadow-none rounded-3"
                size="sm"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
              />
              <Button type="submit" variant="outline-secondary" size="sm" className="ms-1" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                <i className="bi bi-search"></i>
              </Button>
            </Form>
          </div>
        </div>
      </div>

      <Row>
        {/* SIDEBAR – visible only on lg+ */}
        <Col lg={3} className="d-none d-lg-block mb-4">
          <Card className="modern-card mb-4 border-0">
            <Card.Body className="p-3">
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder="Search in category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-end-0 shadow-none bg-light"
                  />
                  <Button variant="light" type="submit" className="border border-start-0 text-muted">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>

          <Card className="modern-card mb-4 border-0">
            <Card.Header className="bg-white border-bottom p-3">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-grid-fill me-2" style={{ color: 'var(--brand-primary)' }}></i> Select Topic
              </h6>
            </Card.Header>
            <ListGroup variant="flush" className="p-2">
              {subcategories.map(sc => {
                const isActive = selectedSubcategory?.id === sc.id;
                return (
                  <ListGroup.Item
                    key={sc.id}
                    action
                    onClick={() => handleSubcategoryClick(sc)}
                    className="border-0 rounded-3 mb-1 d-flex align-items-center transition-all fw-medium"
                    style={{
                      background: isActive ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-muted)'
                    }}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <div style={{ width: '4px', height: '16px', background: isActive ? 'white' : '#e2e8f0', borderRadius: '2px', marginRight: '0.75rem' }}></div>
                      {sc.name}
                    </div>
                    {isActive && <i className="bi bi-chevron-right ms-auto"></i>}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>

          <Card className="modern-card mb-4 border-0">
            <Card.Header className="bg-white border-bottom p-3">
              <h6 className="mb-0 fw-bold">
                <i className="bi bi-filter-circle-fill me-2" style={{ color: 'var(--brand-primary)' }}></i> Filter by Level
              </h6>
            </Card.Header>
            <ListGroup variant="flush" className="p-2">
              {[
                { value: '', label: 'All Levels', icon: 'bi-layer-backward' },
                { value: 'beginner', label: 'Beginner', icon: 'bi-battery-half' },
                { value: 'intermediate', label: 'Intermediate', icon: 'bi-battery-full' },
                { value: 'advanced', label: 'Advanced', icon: 'bi-lightning-charge-fill' }
              ].map(level => {
                const isActive = difficulty === level.value;
                return (
                  <ListGroup.Item
                    key={level.value}
                    action
                    onClick={() => handleDifficultyClick(level.value)}
                    className="border-0 rounded-3 mb-1 d-flex align-items-center transition-all fw-medium"
                    style={{
                      background: isActive ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-muted)'
                    }}
                  >
                    <i className={`bi ${level.icon} me-3`}></i>{level.label}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card>
        </Col>

        {/* COURSES GRID */}
        <Col lg={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-bold text-dark">
              {courses.length}{nextUrl ? '+' : ''} {courses.length === 1 ? 'Course' : 'Courses'}
              {difficulty && (
                <span className="text-muted fw-normal ms-2">
                  - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
              )}
            </h5>
          </div>

          {courses.length > 0 ? (
            <>
              {/* FIX: xs={6} on Col = 2 cards per row on mobile (50% width each).
                  sm={6} keeps 2-per-row on small tablets, md={4} gives 3-per-row on medium+.
                  Previously xs={4} forced 3 cards into ~125px each on a 375px screen. */}
              <Row className="g-3 g-md-4">
                {courses.map(course => (
                  <Col key={course.id} xs={6} sm={6} md={4}>
                    <Card className="h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                      <div className="d-none d-sm-block">
                        {course.thumbnail ? (
                          <Card.Img
                            variant="top"
                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                            style={{ height: '160px', objectFit: 'cover' }}
                            alt={course.title}
                          />
                        ) : (
                          <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-image" style={{ color: '#cbd5e1', fontSize: '2rem' }}></i>
                          </div>
                        )}
                      </div>

                      <Card.Body className="d-flex flex-column p-2 p-sm-3 p-md-4 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge
                            style={{
                              backgroundColor: getDifficultyColor(course.difficulty),
                              padding: '0.25rem 0.5rem', borderRadius: '4px',
                              textTransform: 'capitalize', fontWeight: '500', fontSize: '0.65rem'
                            }}
                          >
                            {course.difficulty}
                          </Badge>
                          <span className="fw-bold" style={{ color: course.is_free ? '#10b981' : 'var(--text-main)', fontSize: '0.75rem' }}>
                            {course.is_free ? 'Free' : `$${course.price}`}
                          </span>
                        </div>

                        <Card.Title className="h6 fw-bold mb-1 line-clamp-2 card-title-responsive">
                          {course.title}
                        </Card.Title>

                        <Card.Text className="text-muted small flex-grow-1 line-clamp-2 mb-2 card-desc-responsive">
                          {stripHtml(course.short_description)}
                        </Card.Text>

                        <Button
                          as={Link}
                          to={`/course/${course.id}`}
                          variant="outline-primary"
                          className="mt-auto w-100 fw-bold rounded-3 btn-responsive"
                          size="sm"
                        >
                          View Course
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Load More — only shown when backend has additional pages */}
              {nextUrl && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4"
                    onClick={fetchMoreCourses}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <><Spinner animation="border" size="sm" className="me-2" />Loading...</>
                    ) : (
                      'Load more courses'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="modern-card border-0 text-center py-5">
              <Card.Body>
                <i className="bi bi-search display-1 text-light mb-4 d-block"></i>
                <h4 className="fw-bold text-dark mb-3">No courses found</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
                  {difficulty
                    ? `No ${difficulty} level courses available in this category right now.`
                    : 'No courses available in this category.'}
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  {difficulty && (
                    <Button variant="outline-primary" onClick={() => handleDifficultyClick('')} className="px-4 py-2 fw-medium">
                      Show All Levels
                    </Button>
                  )}
                  <Button as={Link} to="/courses" className="btn-primary px-4 py-2">
                    Browse All Courses
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .transition-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .transition-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }

        @media (max-width: 576px) {
          .card-title-responsive { font-size: 0.8rem !important; line-height: 1.2 !important; }
          .card-desc-responsive { font-size: 0.7rem !important; }
          .btn-responsive { font-size: 0.7rem !important; padding: 0.2rem 0.4rem !important; }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .card-title-responsive { font-size: 0.9rem !important; }
          .card-desc-responsive { font-size: 0.8rem !important; }
          .btn-responsive { font-size: 0.8rem !important; padding: 0.4rem 0.75rem !important; }
        }
      `}</style>
    </Container>
  );
}

export default SubCategoryPage;
