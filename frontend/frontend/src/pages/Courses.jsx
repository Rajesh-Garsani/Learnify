import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig'; // Ensure this path is correct for your project
import "../index.css";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering State
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [difficultyFilter, priceFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Build the query string based on filters
      let query = '/api/courses/?';
      if (difficultyFilter) query += `difficulty=${difficultyFilter}&`;
      if (priceFilter === 'free') query += `is_free=true&`;
      if (priceFilter === 'paid') query += `is_free=false&`;

      const res = await axios.get(query);
      const coursesData = res.data.results || res.data;
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getDifficultyColor = (level) => {
    switch(level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* Page Header */}
      <div className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="fw-bold display-5 mb-2" style={{ color: 'var(--text-main)' }}>Course Catalog</h1>
              <p className="text-muted fs-5 mb-0">Browse our complete library of professional programming courses.</p>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {error && <Alert variant="danger" className="border-0 shadow-sm rounded-3">{error}</Alert>}

        <Row>
          {/* Sidebar Filters */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Filter Courses</h5>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small text-uppercase">Difficulty</Form.Label>
                  <Form.Select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="shadow-none rounded-3"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small text-uppercase">Price</Form.Label>
                  <Form.Select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="shadow-none rounded-3"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free Courses</option>
                    <option value="paid">Premium (Paid)</option>
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="outline-secondary"
                  className="w-100 rounded-3"
                  onClick={() => { setDifficultyFilter(''); setPriceFilter(''); }}
                >
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Course Grid */}
          <Col lg={9}>
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" style={{ color: 'var(--brand-primary)' }} />
              </div>
            ) : (
              <Row className="g-4">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <Col key={course.id} xs={12} sm={6} xl={4}>
                      <Card className="modern-card h-100 border-0" style={{ borderRadius: '12px' }}>
                        {course.thumbnail ? (
                          <div style={{ position: 'relative' }}>
                            <Card.Img
                              variant="top"
                              src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                              style={{ height: '160px', objectFit: 'cover' }}
                              alt={course.title}
                            />
                          </div>
                        ) : (
                          <div style={{ height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-image" style={{ color: '#cbd5e1', fontSize: '2rem' }}></i>
                          </div>
                        )}

                        <Card.Body className="d-flex flex-column p-3">
                          <Card.Title className="fw-bold mb-1" style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.2' }}>
                            {course.title}
                          </Card.Title>

                          <Card.Text className="text-muted flex-grow-1 mb-3" style={{
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4', fontSize: '0.8rem'
                          }}>
                            {stripHtml(course.short_description)}
                          </Card.Text>

                           <div className="d-flex justify-content-between align-items-center mt-auto mb-3">
                            <Badge
                              style={{
                                backgroundColor: getDifficultyColor(course.difficulty),
                                padding: '0.25rem 0.5rem', borderRadius: '4px',
                                textTransform: 'capitalize', fontWeight: '500', fontSize: '0.7rem'
                              }}
                            >
                              {course.difficulty}
                            </Badge>
                            <span className="fw-bold text-muted" style={{ fontSize: '0.8rem' }}>
                              {course.is_free ? 'Free' : `$${course.price}`}
                            </span>
                          </div>

                          <Button as={Link} to={`/course/${course.id}`} variant="primary" className="w-100 py-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                            View Course
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col xs={12}>
                    <div className="text-center py-5 bg-white rounded-4 shadow-sm border" style={{ borderColor: '#f1f5f9' }}>
                      <i className="bi bi-search mb-2" style={{ color: '#cbd5e1', fontSize: '2.5rem' }}></i>
                      <h5 style={{ color: 'var(--text-main)' }}>No courses found</h5>
                      <p className="text-muted small">Try adjusting your filters to see more results.</p>
                      <Button variant="outline-primary" onClick={() => { setDifficultyFilter(''); setPriceFilter(''); }}>
                        Clear Filters
                      </Button>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Courses;