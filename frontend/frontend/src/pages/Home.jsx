import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../App.css";

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
      setCourses(Array.isArray(coursesData) ? coursesData : []);

      const catRes = await axios.get('/api/categories/');
      const categoriesData = catRes.data.results || catRes.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

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
      <div className="container text-center mt-5">
        <h1 className="display-4 fw-bold mb-3 text-animate">
          Learn To Code
        </h1>
         <p className="lead">Build What You Think!</p>
     </div>

      {/* Carousel */}
      <div className="container mt-4 d-flex justify-content-center">
        <div className="card shadow-lg" style={{ width: "90%", borderRadius: "20px", overflow: "hidden" }}>
          <div className="card-body p-0">
            <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel">
              <div className="carousel-indicators">
                <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="0" className="active"></button>
                <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="1"></button>
                <button type="button" data-bs-target="#homeCarousel" data-bs-slide-to="2"></button>
              </div>
              <div className="carousel-inner">
                <div className="carousel-item active">
                  <img src="/images/1.jpg" className="d-block w-100" style={{ height: "40vh", width: "100%", objectFit: "cover", borderRadius: "15px 15px 0 0" }} alt="Slide 1" />
                </div>
                <div className="carousel-item">
                  <img src="/images/2.png" className="d-block w-100" style={{ height: "40vh", objectFit: "cover", borderRadius: "15px 15px 0 0" }} alt="Slide 2" />
                </div>
                <div className="carousel-item">
                  <img src="/images/3.jpg" className="d-block w-100" style={{ height: "40vh", objectFit: "cover", borderRadius: "15px 15px 0 0" }} alt="Slide 3" />
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

      <Row className="mb-5 mt-5">
        <Col>
          <h2 className="mb-4">{sectionTitle}</h2>
        </Col>
      </Row>

      {/* Course Cards */}
      <Row>
        {courses && courses.length > 0 ? (
          courses.map(course => (
            <Col key={course.id} xs={12} sm={6} lg={4} className="mb-4">
              <Card className="h-100 course-card shadow-sm">

                {/* ⭐ ADDED THUMBNAIL HERE ⭐ */}
                {course.thumbnail ? (
                  <Card.Img
                    variant="top"
                    src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://127.0.0.1:8000${course.thumbnail}`}
                    style={{ height: '200px', objectFit: 'cover' }}
                    alt={course.title}
                  />
                ) : (
                  <div style={{ height: '200px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-image text-muted fs-1"></i>
                  </div>
                )}

                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6">{course.title}</Card.Title>
                  <Card.Text className="text-muted small flex-grow-1" style={{
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {stripHtml(course.short_description)}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`badge ${
                        course.difficulty === 'beginner' ? 'bg-success' :
                        course.difficulty === 'intermediate' ? 'bg-warning' : 'bg-danger'
                      } text-capitalize`}>
                        {course.difficulty}
                      </span>
                      <small className="text-muted">
                        {course.is_free ? 'Free' : `$${course.price}`}
                      </small>
                    </div>
                    <Link to={`/course/${course.id}`} className="btn btn-primary btn-sm w-100">
                      View Course
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div className="text-center py-5">
              <i className="bi bi-book fa-3x text-muted mb-3"></i>
              <h4>No courses available</h4>
              <p className="text-muted">Check back later for new courses.</p>
            </div>
          </Col>
        )}
      </Row>

      {/* Categories Section */}
      <Row className="mt-5">
        <Col>
          <h2 className="mb-4">Browse by Category</h2>
          <Row>
            {categories && categories.length > 0 ? (
              categories.map(category => (
                <Col key={category.id} md={4} className="mb-3">
                  <Card className="text-center h-100">
                    <Card.Body className="d-flex flex-column">
                      <i className="bi bi-file-code-fill fs-1 text-primary mb-3"></i>
                      <Card.Title>{category.name}</Card.Title>
                      <Card.Text className="flex-grow-1" style={{
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {stripHtml(category.description) || `Explore ${category.name} courses`}
                      </Card.Text>
                      <Button
                        as={Link}
                        to={`/category/${category.id}`}
                        variant="outline-primary"
                      >
                        Explore
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <Col>
                <div className="text-center py-3">
                  <p className="text-muted">No categories available</p>
                </div>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;