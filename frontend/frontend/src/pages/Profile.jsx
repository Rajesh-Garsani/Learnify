import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyCourses();
  }, [token, navigate]);

  const fetchMyCourses = async () => {
    try {
      const res = await axios.get('/api/progress/my-courses/');
      setCourses(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      {/* Avatar + Greeting */}
      <div className="d-flex align-items-center mb-4 border-bottom pb-3">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{ width: '60px', height: '60px', fontSize: '24px', flexShrink: 0 }}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div className="min-width-0">
          <h2 className="mb-0 text-truncate">Hello, {user?.username}</h2>
          <p className="text-muted mb-0 text-truncate">{user?.email}</p>
        </div>
      </div>

      <h4 className="mb-3">Your Learning History</h4>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : courses.length === 0 ? (
        <Alert variant="info" className="rounded-4 border-0 shadow-sm">
          You haven't started any courses yet. <Link to="/">Browse Courses</Link>
        </Alert>
      ) : (
        <Row xs={6} sm={6} md={4} lg={4} className="g-2 g-md-4">
          {courses.map((course) => (
            <Col key={course.course_id}>
              <Card className="h-100 shadow-sm border-0 transition-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <Card.Body className="d-flex flex-column p-2 p-md-4 gap-1 gap-md-2">
                  <Card.Title className="fw-bold mb-0 line-clamp-2 card-title-responsive">
                    {course.title}
                  </Card.Title>

                  <div className="mt-1">
                    <div className="d-flex justify-content-between small mb-0">
                      <span className="text-muted progress-label">Progress</span>
                      <span className="fw-bold" style={{ color: course.progress === 100 ? '#10b981' : 'var(--brand-primary)' }}>
                        {course.progress}%
                      </span>
                    </div>
                    <ProgressBar
                      now={course.progress}
                      variant={course.progress === 100 ? "success" : "info"}
                      height="6px"
                      className="rounded-pill"
                      style={{ backgroundColor: '#e2e8f0' }}
                    />
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted topics-count">
                      {course.completed} / {course.total} topics
                    </small>
                    <Link
                      to={`/course/${course.course_id}`}
                      className="btn btn-sm btn-outline-primary rounded-pill btn-responsive"
                    >
                      Continue
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

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
        .min-width-0 {
          min-width: 0;
        }

        @media (max-width: 576px) {
          .card-title-responsive {
            font-size: 0.8rem !important;
            line-height: 1.2 !important;
          }
          .card-body {
            padding: 0.5rem !important;
          }
          .btn-responsive {
            font-size: 0.65rem !important;
            padding: 0.15rem 0.5rem !important;
          }
          .progress-label {
            font-size: 0.6rem !important;
          }
          .topics-count {
            font-size: 0.6rem !important;
          }
          .fw-bold {
            font-size: 0.6rem !important;
          }
          .gap-1 {
            gap: 0.15rem !important;
          }
        }
        @media (min-width: 577px) and (max-width: 768px) {
          .card-title-responsive {
            font-size: 0.9rem !important;
          }
          .btn-responsive {
            font-size: 0.75rem !important;
            padding: 0.2rem 0.7rem !important;
          }
        }
      `}</style>
    </Container>
  );
}

export default Profile;
