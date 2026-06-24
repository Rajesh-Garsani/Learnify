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
    try {
      let url = `/api/courses/?subcategory=${subcatId}`;
      if (level) url += `&difficulty=${level}`;
      if (sort === 'newest') url += '&ordering=-created_at';
      if (sort === 'rating') url += '&ordering=-rating';

      const res = await axios.get(url);
      const data = res.data.results || res.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
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
      }

    } catch (err) {
      console.error("Error fetching subcategory data:", err);
      setError("Failed to load category data");
    } finally {
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
      default: return '#6b7280';
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <Container className="my-5 py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading courses...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 py-5">
        <Alert variant="danger" className="text-center" style={{ borderRadius: '8px' }}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
        <div className="text-center">
          <Link to="/" className="btn btn-primary" style={{
            background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 2rem'
          }}>
            <i className="bi bi-house me-2"></i>
            Back to Home
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 pb-5">
      <Breadcrumb className="mt-3" style={{ background: 'transparent', padding: 0 }}>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }} style={{ color: '#666' }}>
          <i className="bi bi-house me-1"></i>
          Home
        </Breadcrumb.Item>
        {selectedSubcategory?.category_name && (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/category/${selectedSubcategory.category}` }} style={{ color: '#666' }}>
            {selectedSubcategory.category_name}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active style={{ color: '#2c5282', fontWeight: '500' }}>
          {selectedSubcategory?.name}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-5">
        <Col>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="fw-bold mb-2" style={{
                background: 'linear-gradient(45deg, #2c5282, #4a90e2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {selectedSubcategory?.name}
              </h1>

              {selectedSubcategory?.description ? (
                <div className="text-muted mb-0" style={{ fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: selectedSubcategory.description }} />
              ) : (
                <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>Explore courses in this category</p>
              )}

              <div className="mt-3">
                <Badge bg="light" text="dark" className="me-2" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '500' }}>
                  <i className="bi bi-book me-1"></i>
                  {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
                </Badge>
                <Badge bg="light" text="dark" style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '500' }}>
                  <i className="bi bi-people me-1"></i>
                  {subcategories.length} Subcategories
                </Badge>
              </div>
            </div>

            <div className="d-none d-lg-block">
              <Form.Select size="sm" value={sortBy} onChange={handleSortChange} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'white', color: '#555' }}>
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
              </Form.Select>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={3} className="mb-4">
          <Card className="mb-4" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: 'none', borderRadius: '12px' }}>
            <Card.Body className="p-3">
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control type="search" placeholder="Search in category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: '1px solid #e0e0e0', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '0.9rem' }} />
                  <Button variant="outline-secondary" type="submit" style={{ border: '1px solid #e0e0e0', borderLeft: 'none', borderRadius: '0 8px 8px 0', color: '#666' }}>
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: 'none', borderRadius: '12px' }}>
            <Card.Header style={{ background: 'white', border: 'none', padding: '1rem 1rem 0.5rem' }}>
              <h6 className="mb-0 fw-semibold" style={{ display: 'flex', alignItems: 'center' }}><i className="bi bi-grid me-2" style={{ color: '#2c5282' }}></i> Select Language</h6>
            </Card.Header>
            <ListGroup variant="flush" style={{ padding: '0.5rem' }}>
              {subcategories.map(sc => (
                <ListGroup.Item key={sc.id} action onClick={() => handleSubcategoryClick(sc)} style={{ border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.25rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', background: selectedSubcategory?.id === sc.id ? 'linear-gradient(135deg, #2c5282, #4a90e2)' : 'transparent', color: selectedSubcategory?.id === sc.id ? 'white' : '#555' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ width: '4px', height: '16px', background: selectedSubcategory?.id === sc.id ? 'white' : '#e0e0e0', borderRadius: '2px', marginRight: '0.75rem', transition: 'all 0.3s ease' }}></div>
                    <span>{sc.name}</span>
                  </div>
                  {selectedSubcategory?.id === sc.id && <i className="bi bi-chevron-right ms-auto"></i>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Card className="mb-4" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: 'none', borderRadius: '12px' }}>
            <Card.Header style={{ background: 'white', border: 'none', padding: '1rem 1rem 0.5rem' }}>
              <h6 className="mb-0 fw-semibold" style={{ display: 'flex', alignItems: 'center' }}><i className="bi bi-filter me-2" style={{ color: '#2c5282' }}></i> Filter by Level</h6>
            </Card.Header>
            <ListGroup variant="flush">
              {[
                { value: '', label: 'All Levels', icon: 'bi-grid' },
                { value: 'beginner', label: 'Beginner', icon: 'bi-arrow-up-right-circle' },
                { value: 'intermediate', label: 'Intermediate', icon: 'bi-arrow-up-right-circle-fill' },
                { value: 'advanced', label: 'Advanced', icon: 'bi-star-fill' }
              ].map(level => (
                <ListGroup.Item key={level.value} action onClick={() => handleDifficultyClick(level.value)} style={{ border: 'none', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.25rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', background: difficulty === level.value ? 'linear-gradient(135deg, #2c5282, #4a90e2)' : 'transparent', color: difficulty === level.value ? 'white' : '#555' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <i className={`bi ${level.icon} me-2`}></i>
                    <span>{level.label}</span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <div className="d-lg-none mb-4">
            <Card style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: 'none', borderRadius: '12px' }}>
              <Card.Body className="p-3">
                <Form.Select value={sortBy} onChange={handleSortChange} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.9rem', background: 'white', color: '#555', width: '100%' }}>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </Form.Select>
              </Card.Body>
            </Card>
          </div>
        </Col>

        <Col lg={9}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h5 className="mb-0 fw-semibold" style={{ fontSize: '1.1rem' }}>
              {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} Available
              {difficulty && <span className="text-muted fw-normal" style={{ marginLeft: '0.5rem' }}>- {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level</span>}
            </h5>
            <small className="text-muted" style={{ fontSize: '0.9rem' }}>Showing {courses.length} of {courses.length} results</small>
          </div>

          {courses.length > 0 ? (
            <Row className="g-4">
              {courses.map(course => (
                <Col key={course.id} xs={12} sm={6} xl={4}>
                  <Card className="h-100" style={{ borderRadius: '12px', border: '1px solid #eaeaea', transition: 'all 0.3s ease', overflow: 'hidden' }}>

                    {/* ⭐ ADDED THUMBNAIL HERE ⭐ */}
                    {course.thumbnail ? (
                      <Card.Img
                        variant="top"
                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                        style={{ height: '180px', objectFit: 'cover' }}
                        alt={course.title}
                      />
                    ) : (
                      <div style={{ height: '180px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-image text-muted fs-1"></i>
                      </div>
                    )}

                    <Card.Body style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <Badge style={{ backgroundColor: getDifficultyColor(course.difficulty), color: 'white', fontWeight: '500', padding: '0.4rem 0.75rem', borderRadius: '20px', textTransform: 'capitalize' }}>
                          {course.difficulty}
                        </Badge>
                        <span style={{ fontWeight: '600', color: course.is_free ? '#10b981' : '#2c5282', fontSize: '0.9rem' }}>
                          {course.is_free ? <><i className="bi bi-gift me-1"></i>Free</> : `$${course.price}`}
                        </span>
                      </div>
                      <Card.Title className="h6 fw-semibold" style={{ marginBottom: '0.75rem', color: '#333', lineHeight: '1.4' }}>{course.title}</Card.Title>
                      <Card.Text className="text-muted small" style={{ marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                        {stripHtml(course.short_description)}
                      </Card.Text>
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}><i className="bi bi-clock" style={{ color: '#666', marginRight: '0.25rem' }}></i><small style={{ color: '#666' }}>{course.duration || 'Self-paced'}</small></div>
                          {course.rating && <div style={{ display: 'flex', alignItems: 'center' }}><i className="bi bi-star-fill" style={{ color: '#f59e0b', marginRight: '0.25rem' }}></i><small style={{ color: '#666' }}>{course.rating}</small></div>}
                        </div>
                        <Button as={Link} to={`/course/${course.id}`} style={{ width: '100%', background: 'linear-gradient(135deg, #2c5282, #4a90e2)', border: 'none', borderRadius: '8px', padding: '0.75rem', fontWeight: '500', transition: 'all 0.3s ease' }}>
                          <i className="bi bi-play-circle me-2"></i> Start Learning
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: 'none', borderRadius: '12px' }}>
              <Card.Body className="text-center py-5">
                <div style={{ marginBottom: '1.5rem' }}><i className="bi bi-search" style={{ fontSize: '4rem', color: '#ddd' }}></i></div>
                <h4 className="mb-3" style={{ color: '#333' }}>No courses found</h4>
                <p className="text-muted mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>{difficulty ? `No ${difficulty} level courses available in this category.` : 'No courses available in this category.'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <Button variant="outline-primary" onClick={() => handleDifficultyClick('')} style={{ borderColor: '#4a90e2', color: '#4a90e2', borderRadius: '8px', padding: '0.5rem 1.5rem' }}>Show All Levels</Button>
                  <Button variant="primary" as={Link} to="/courses" style={{ background: 'linear-gradient(135deg, #2c5282, #4a90e2)', border: 'none', borderRadius: '8px', padding: '0.5rem 1.5rem' }}>Browse All Courses</Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default SubCategoryPage;