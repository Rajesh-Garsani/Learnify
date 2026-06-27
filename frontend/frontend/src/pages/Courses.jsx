import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import "../index.css";

const API_BASE_URL = process.env.VITE_API_URL || axios.defaults.baseURL || 'http://localhost:8000';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [difficultyFilter, priceFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
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

  const DifficultySelect = ({ compact = false }) => (
    <Form.Select
      value={difficultyFilter}
      onChange={(e) => setDifficultyFilter(e.target.value)}
      className="shadow-none rounded-3"
      size={compact ? "sm" : undefined}
      style={compact ? { fontSize: '0.7rem', padding: '0.2rem 0.5rem' } : {}}
    >
      <option value="">All Levels</option>
      <option value="beginner">Beginner</option>
      <option value="intermediate">Intermediate</option>
      <option value="advanced">Advanced</option>
    </Form.Select>
  );

  const PriceSelect = ({ compact = false }) => (
    <Form.Select
      value={priceFilter}
      onChange={(e) => setPriceFilter(e.target.value)}
      className="shadow-none rounded-3"
      size={compact ? "sm" : undefined}
      style={compact ? { fontSize: '0.7rem', padding: '0.2rem 0.5rem' } : {}}
    >
      <option value="">All Prices</option>
      <option value="free">Free Courses</option>
      <option value="paid">Premium (Paid)</option>
    </Form.Select>
  );

  const ClearButton = ({ compact = false }) => (
    <Button
      variant="outline-secondary"
      className="rounded-3"
      size={compact ? "sm" : undefined}
      style={compact ? { fontSize: '0.7rem', padding: '0.2rem 0.5rem', width: '100%' } : { width: '100%' }}
      onClick={() => { setDifficultyFilter(''); setPriceFilter(''); }}
    >
      Clear
    </Button>
  );

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '4rem' }}>

      <div className="bg-white border-bottom py-5 mb-4 shadow-sm">
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

        <div
          className="bg-white p-2 rounded-4 shadow-sm mb-3 d-lg-none sticky-top"
          style={{ zIndex: 1030, top: '0' }}
        >
          <div className="d-flex flex-nowrap gap-2 align-items-center">
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <Form.Label className="fw-medium text-muted small text-uppercase mb-0" style={{ fontSize: '0.6rem' }}>
                Difficulty
              </Form.Label>
              <DifficultySelect compact />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <Form.Label className="fw-medium text-muted small text-uppercase mb-0" style={{ fontSize: '0.6rem' }}>
                Price
              </Form.Label>
              <PriceSelect compact />
            </div>
            <div style={{ flex: '0 0 auto' }}>
              <ClearButton compact />
            </div>
          </div>
        </div>

        <Row>
          <Col lg={3} className="d-none d-lg-block">
            <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Filter Courses</h5>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small text-uppercase">Difficulty</Form.Label>
                  <DifficultySelect />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small text-uppercase">Price</Form.Label>
                  <PriceSelect />
                </Form.Group>
                <ClearButton />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9}>
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" style={{ color: 'var(--brand-primary)' }} />
              </div>
            ) : (
              <Row className="g-3 g-md-4">
                {courses.length > 0 ? (
                  courses.map(course => (
                    <Col key={course.id} xs={6} sm={6} md={4} lg={4}>
                      <Card className="h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        <div className="d-none d-sm-block">
                          {course.thumbnail ? (
                            <Card.Img
                              variant="top"
                              src={course.thumbnail.startsWith('http') ? course.thumbnail : `${API_BASE_URL}${course.thumbnail}`}
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
                          <div className="d-flex justify-content-between align-items-start mb-1 mb-sm-2">
                            <Badge
                              style={{
                                backgroundColor: getDifficultyColor(course.difficulty),
                                padding: '0.2rem 0.4rem', borderRadius: '4px',
                                textTransform: 'capitalize', fontWeight: '500', fontSize: '0.65rem'
                              }}
                            >
                              {course.difficulty}
                            </Badge>
                            <span className="fw-bold" style={{ color: course.is_free ? '#10b981' : 'var(--text-main)', fontSize: '0.7rem' }}>
                              {course.is_free ? 'Free' : `$${course.price}`}
                            </span>
                          </div>

                          <Card.Title className="h6 fw-bold mb-1 line-clamp-2 card-title-responsive" style={{ fontSize: '0.85rem' }}>
                            {course.title}
                          </Card.Title>

                          <Card.Text className="text-muted small flex-grow-1 line-clamp-2 mb-2 card-desc-responsive" style={{ fontSize: '0.7rem' }}>
                            {stripHtml(course.short_description)}
                          </Card.Text>

                          <Button
                            as={Link}
                            to={`/course/${course.id}`}
                            variant="outline-primary"
                            className="mt-auto w-100 fw-bold rounded-3 btn-responsive"
                            size="sm"
                            style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                          >
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

      <style>{`
        .transition-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .transition-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        @media (max-width: 576px) {
          .card-title-responsive { font-size: 0.8rem !important; }
          .card-desc-responsive { font-size: 0.7rem !important; }
          .btn-responsive { font-size: 0.7rem !important; padding: 0.2rem 0.4rem !important; }
          .card-body { padding: 0.5rem !important; }
          .badge { font-size: 0.55rem !important; }
          .fw-bold { font-size: 0.65rem !important; }
        }
        @media (min-width: 577px) and (max-width: 768px) {
          .card-title-responsive { font-size: 0.9rem !important; }
          .card-desc-responsive { font-size: 0.75rem !important; }
          .btn-responsive { font-size: 0.75rem !important; padding: 0.25rem 0.5rem !important; }
        }
      `}</style>
    </div>
  );
}

export default Courses;
