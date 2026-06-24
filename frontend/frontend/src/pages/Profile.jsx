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
      // This endpoint returns a list of courses with { progress: 50, ... }
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
      <div className="d-flex align-items-center mb-4 border-bottom pb-3">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', fontSize: '24px'}}>
            {user?.username?.charAt(0).toUpperCase()}
        </div>
        <div>
            <h2 className="mb-0">Hello, {user?.username}</h2>
            <p className="text-muted mb-0">{user?.email}</p>
        </div>
      </div>

      <h4 className="mb-3">Your Learning History</h4>

      {loading ? (
        <Spinner animation="border" />
      ) : courses.length === 0 ? (
        <Alert variant="info">
          You haven't started any courses yet. <Link to="/">Browse Courses</Link>
        </Alert>
      ) : (
        <Row>
          {courses.map((course) => (
            <Col md={6} lg={4} key={course.course_id} className="mb-4">
              <Card className="h-100 shadow-sm border-0 bg-light">
                <Card.Body>
                  <Card.Title>{course.title}</Card.Title>

                  <div className="mt-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Progress</span>
                      <span className="fw-bold">{course.progress}%</span>
                    </div>
                    <ProgressBar
                      now={course.progress}
                      variant={course.progress === 100 ? "success" : "info"}
                      height="10px"
                    />
                  </div>

                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {course.completed} / {course.total} topics
                    </small>
                    <Link to={`/course/${course.course_id}`} className="btn btn-sm btn-outline-primary">
                      Continue
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Profile;