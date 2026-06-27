import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../App.css";

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000';

function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("Featured Courses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomeContent();
  }, []);

  const fetchHomeContent = async () => {
    setLoading(true);
    try {
      const courseRes = await axios.get('/api/courses/recommendations/');
      setSectionTitle(courseRes.data.title || "Featured Courses");
      const coursesData = courseRes.data.results || courseRes.data;
      setCourses(Array.isArray(coursesData) ? coursesData.slice(0, 6) : []);

      const catRes = await axios.get('/api/categories/');
      const categoriesData = catRes.data.results || catRes.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData.slice(0, 6) : []);
    } catch (error) {
      console.error('Error fetching home content:', error);
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

  if (loading) {
    return (
      <Container className="my-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Hero Section */}
      <div className="container text-center mt-5 mb-4">
        <h1 className="display-4 fw-bold mb-3 text-animate" style={{ color: 'var(--brand-primary)' }}>
          Learn To Code
        </h1>
      </div>

      {/* Carousel */}
      <div className="container mt-4 d-flex justify-content-center mb-5">
        <div className="card shadow-lg" style={{ width: "100%", maxWidth: "900px", borderRadius: "20px", overflow: "hidden", border: 'none' }}>
          <div className="card-body p-0">
            <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" className="active"></button>
                <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1"></button>
                <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2"></button>
              </div>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src="/images/1.jpg" className="d-block w-100" style={{ height: "40vh", minHeight: "300px", width: "100%", objectFit: "cover" }} alt="Slide 1" />
                </div>
                <div className="carousel-item">
                  <img src="/images/2.png" className="d-block w-100" style={{ height: "40vh", minHeight: "300px", objectFit: "cover" }} alt="Slide 2" />
                </div>
                <div className="carousel-item">
                  <img src="/images/3.jpg" className="d-block w-100" style={{ height: "40vh", minHeight: "300px", objectFit: "cover" }} alt="Slide 3" />
                </div>
              </div>
              <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
                <span className="carousel-control-prev-icon"></span>
              </button>
              <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
        <h3 className="fw-bold m-0 text-dark">{sectionTitle}</h3>
        <Link to="/courses" className="text-decoration-none fw-semibold" style={{ color: 'var(--brand-primary)' }}>
          View All <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <Row className="g-4 mb-5">
        {courses && courses.length > 0 ? (
          courses.map(course => (
            <Col key={course.id} xs={4} sm={6} md={4}>
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
                    <div style={{ height: '160px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="bi bi-image text-muted fs-1"></i>
                    </div>
                  )}
                </div>

                <Card.Body className="d-flex flex-column p-3 p-md-4 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-dark border text-capitalize px-2 py-1">
                      {course.difficulty}
                    </span>
                    <span className="fw-bold" style={{ color: course.is_free ? '#10b981' : 'var(--text-main)', fontSize: '0.9rem' }}>
                      {course.is_free ? 'Free' : `$${course.price}`}
                    </span>
                  </div>

                  <Card.Title className="h6 fw-bold mb-2 line-clamp-2 card-title-responsive">{course.title}</Card.Title>

                  <Card.Text className="text-muted small flex-grow-1 line-clamp-2 mb-3 card-desc-responsive">
                    {stripHtml(course.short_description)}
                  </Card.Text>

                  <Link to={`/course/${course.id}`} className="btn btn-outline-primary btn-sm w-100 fw-bold mt-auto rounded-3 btn-responsive">
                    View Course
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center py-5 bg-white rounded-3 shadow-sm">
              <i className="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
              <h5>No courses available</h5>
              <p className="text-muted mb-0">Check back later for new courses.</p>
            </div>
          </Col>
        )}
      </Row>

      <div className="d-flex justify-content-between align-items-center mb-4 mt-5">
        <h3 className="fw-bold m-0 text-dark">Browse by Category</h3>
        <Link to="/categories" className="text-decoration-none fw-semibold" style={{ color: 'var(--brand-primary)' }}>
          View All <i className="bi bi-arrow-right"></i>
        </Link>
      </div>

      <Row className="g-4 mb-5">
        {categories && categories.length > 0 ? (
          categories.map(category => (
            <Col key={category.id} xs={4} sm={6} md={4}>
              <Card className="text-center h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '12px' }}>
                <Card.Body className="d-flex flex-column p-4 flex-grow-1">
                  <div className="mb-3">
                    <div style={{
                      width: '60px', height: '60px', margin: '0 auto',
                      background: 'rgba(13, 148, 136, 0.1)', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <i className="bi bi-grid-fill fs-3" style={{ color: 'var(--brand-primary)' }}></i>
                    </div>
                  </div>
                  <Card.Title className="fw-bold h5 mb-2 card-title-responsive">{category.name}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1 line-clamp-2 mb-4 card-desc-responsive">
                    {stripHtml(category.description) || `Explore all courses related to ${category.name}.`}
                  </Card.Text>
                  <Button
                    as={Link}
                    to={`/category/${category.id}`}
                    className="btn btn-light w-100 fw-bold border mt-auto rounded-3 btn-responsive"
                    style={{ color: '#ffffff' }}
                  >
                    Explore
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center py-5 bg-white rounded-3 shadow-sm">
              <i className="bi bi-folder-x display-4 text-muted mb-3 d-block"></i>
              <h5>No categories available</h5>
            </div>
          </Col>
        )}
      </Row>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .transition-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .transition-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
        @media (max-width: 576px) {
          .card-title-responsive { font-size: 0.85rem !important; }
          .card-desc-responsive { font-size: 0.75rem !important; }
          .btn-responsive { font-size: 0.75rem !important; padding: 0.3rem 0.5rem !important; }
          .card-body { padding: 0.75rem !important; }
        }
        @media (min-width: 577px) and (max-width: 768px) {
          .card-title-responsive { font-size: 0.95rem !important; }
          .card-desc-responsive { font-size: 0.8rem !important; }
          .btn-responsive { font-size: 0.8rem !important; padding: 0.4rem 0.75rem !important; }
        }
      `}</style>
    </Container>
  );
}

export default Home;
