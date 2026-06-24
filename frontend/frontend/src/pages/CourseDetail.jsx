import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Spinner, Alert, ProgressBar, Button, Badge } from 'react-bootstrap';
import axios from '../axiosConfig';

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) {
      setShowLoginPopup(true);
    }
    fetchCourseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await axios.get(`/api/courses/${courseId}/`);
      setCourse(courseRes.data);

      const topicRes = await axios.get(`/api/topics/?course=${courseId}`);
      const topicsData = topicRes.data.results || topicRes.data.topics || topicRes.data;
      setTopics(Array.isArray(topicsData) ? topicsData : []);

      if (token) {
        try {
          const timestamp = new Date().getTime();
          const progressRes = await axios.get(`/api/progress/course/${courseId}/?t=${timestamp}`);
          setProgress(progressRes.data);

          if (progressRes.data.completed_topic_ids) {
            setCompletedIds(progressRes.data.completed_topic_ids);
          }
        } catch (progErr) {
          console.error("Progress fetch failed:", progErr);
        }
      }

    } catch (err) {
      console.error(err);
      setError("Could not load course data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePopupLogin = () => {
    navigate('/login');
  };

  const handleStartLearning = () => {
    if (topics.length > 0) {
      navigate(`/topic/${topics[0].id}`);
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

  // ⭐ FIX: Helper function to safely strip HTML tags for plain text previews (like in the Syllabus tab)
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) return (
    <Container className="my-5 py-5">
      <div className="text-center">
        <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading course details...</p>
      </div>
    </Container>
  );

  if (error) return (
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

  return (
    <>
      {/* LOGIN POPUP OVERLAY */}
      {showLoginPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
            width: '100%', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'white',
              fontSize: '1.5rem'
            }}>
              <i className="bi bi-lock"></i>
            </div>
            <h4 style={{
              background: 'linear-gradient(45deg, #2c5282, #4a90e2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '1rem'
            }}>
              Unlock Your Learning Journey!
            </h4>
            <p className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
              Login to track your progress, save your history, and earn certificates as you learn.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                onClick={handlePopupLogin}
                style={{
                  background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login Now
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => setShowLoginPopup(false)}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '500'
                }}
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      )}

      <Container className="mt-4 pb-5">
        {/* Breadcrumb */}
        <div style={{
          background: 'transparent',
          padding: 0,
          marginBottom: '1.5rem'
        }}>
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>
            <i className="bi bi-house me-1"></i>
            Home
          </Link>
          <span className="mx-2" style={{ color: '#999' }}>/</span>
          <Link to="/courses" style={{ color: '#666', textDecoration: 'none' }}>
            Courses
          </Link>
          <span className="mx-2" style={{ color: '#999' }}>/</span>
          <span style={{ color: '#2c5282', fontWeight: '500' }}>
            {course?.title}
          </span>
        </div>

        <Row>
          {/* Main Content */}
          <Col lg={8}>
            {/* Course Header */}
            <div style={{
              background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
              borderRadius: '12px',
              padding: '2rem',
              color: 'white',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Badge style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '20px',
                      textTransform: 'capitalize'
                    }}>
                      {course?.difficulty}
                    </Badge>
                    <Badge style={{
                      background: course?.is_free ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: 'white',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '20px'
                    }}>
                      {course?.is_free ? 'Free' : `$${course?.price}`}
                    </Badge>
                  </div>

                  <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {course?.title}
                  </h1>

                  {/* ⭐ FIX 1: Applied HTML bypass to short_description */}
                  {course?.short_description && (
                    <div
                      style={{ opacity: 0.9, fontSize: '1.1rem', marginBottom: '1.5rem' }}
                      dangerouslySetInnerHTML={{ __html: course.short_description }}
                    />
                  )}

                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <i className="bi bi-clock me-2" style={{ fontSize: '1.2rem' }}></i>
                      <span>{course?.duration || 'Self-paced'}</span>
                    </div>

                    {course?.rating && (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="bi bi-star-fill me-2" style={{ color: '#fbbf24' }}></i>
                        <span>{course.rating}/5.0</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Start Learning Button */}
                <div style={{ marginLeft: '2rem' }}>
                  <Button
                    onClick={handleStartLearning}
                    style={{
                      background: 'white',
                      color: '#2c5282',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 2rem',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Start Learning
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #eaeaea',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'overview' ? '2px solid #2c5282' : '2px solid transparent',
                  color: activeTab === 'overview' ? '#2c5282' : '#666',
                  fontWeight: activeTab === 'overview' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('syllabus')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'syllabus' ? '2px solid #2c5282' : '2px solid transparent',
                  color: activeTab === 'syllabus' ? '#2c5282' : '#666',
                  fontWeight: activeTab === 'syllabus' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Syllabus ({topics.length})
              </button>
              <button
                onClick={() => setActiveTab('instructor')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'instructor' ? '2px solid #2c5282' : '2px solid transparent',
                  color: activeTab === 'instructor' ? '#2c5282' : '#666',
                  fontWeight: activeTab === 'instructor' ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Instructor
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'overview' && (
              <Card style={{
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                <Card.Body style={{ padding: '2rem' }}>
                  <h4 style={{
                    color: '#2c5282',
                    marginBottom: '1.5rem',
                    fontWeight: '600'
                  }}>
                    About This Course
                  </h4>
                  <div style={{ lineHeight: '1.8', color: '#555' }}>
                    <div dangerouslySetInnerHTML={{ __html: course?.description }} />
                  </div>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'syllabus' && (
              <Card style={{
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                <Card.Header style={{
                  background: 'white',
                  borderBottom: '1px solid #eaeaea',
                  padding: '1.5rem 2rem'
                }}>
                  <h5 className="mb-0" style={{ fontWeight: '600' }}>
                    Course Curriculum
                  </h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {topics.length > 0 ? (
                    topics.map((topic, index) => {
                      const isCompleted = completedIds.includes(topic.id);
                      return (
                        <ListGroup.Item
                          key={topic.id}
                          as={Link}
                          to={`/topic/${topic.id}`}
                          style={{
                            padding: '1.25rem 2rem',
                            border: 'none',
                            borderBottom: '1px solid #f5f5f5',
                            textDecoration: 'none',
                            color: '#333',
                            transition: 'all 0.2s',
                            background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              background: isCompleted ? '#10b981' : 'linear-gradient(135deg, #2c5282, #4a90e2)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              marginRight: '1rem',
                              flexShrink: 0
                            }}>
                              {isCompleted ? (
                                <i className="bi bi-check"></i>
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                                {topic.title}
                              </div>

                              {/* ⭐ FIX 2: Applied stripHtml before substring so raw tags don't break the UI */}
                              {topic.description && (
                                <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                                  {stripHtml(topic.description).substring(0, 80)}...
                                </small>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {topic.duration && (
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {topic.duration}
                              </small>
                            )}
                            <i className={`bi ${isCompleted ? 'bi-check-circle-fill text-success' : 'bi-play-circle text-primary'}`} style={{ fontSize: '1.25rem' }}></i>
                          </div>
                        </ListGroup.Item>
                      );
                    })
                  ) : (
                    <ListGroup.Item style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                      <i className="bi bi-folder-x mb-2" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                      <div>No topics available yet.</div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            )}

            {activeTab === 'instructor' && (
              <Card style={{
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                <Card.Body style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: '600'
                    }}>
                      {course?.instructor?.name?.charAt(0) || 'A'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
                        {course?.instructor?.name || 'LearnAI Instructor'}
                      </h5>
                      <p className="text-muted" style={{ marginBottom: '1rem' }}>
                        {course?.instructor?.bio || 'Expert instructor with years of experience in this field.'}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <small>
                          <i className="bi bi-award me-1"></i>
                          Expert
                        </small>
                        <small>
                          <i className="bi bi-chat-left-text me-1"></i>
                          Available for Q&A
                        </small>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Progress Section */}
            {token && progress && (
              <Card style={{
                border: '1px solid #eaeaea',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <Card.Header style={{
                  background: 'white',
                  borderBottom: '1px solid #eaeaea',
                  padding: '1.5rem'
                }}>
                  <h5 className="mb-0" style={{ fontWeight: '600' }}>
                    <i className="bi bi-graph-up me-2" style={{ color: '#2c5282' }}></i>
                    Your Progress
                  </h5>
                </Card.Header>
                <Card.Body style={{ padding: '1.5rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      margin: '0 auto 1rem'
                    }}>
                      <ProgressBar
                        now={progress.progress_percent}
                        variant="primary"
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: 'conic-gradient(#2c5282 0%, #4a90e2 0% 50%, #eaeaea 50% 100%)',
                          transform: 'rotate(-90deg)'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2c5282' }}>
                          {progress.progress_percent}%
                        </div>
                        <small style={{ color: '#666' }}>Complete</small>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c5282' }}>
                          {progress.completed_topics || 0}
                        </div>
                        <small style={{ color: '#666' }}>Completed</small>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c5282' }}>
                          {progress.total_topics || topics.length}
                        </div>
                        <small style={{ color: '#666' }}>Total Topics</small>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontWeight: '500'
                    }}
                    onClick={handleStartLearning}
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    {progress.progress_percent === 0 ? 'Start Learning' : 'Continue Learning'}
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Course Stats */}
            <Card style={{
              border: '1px solid #eaeaea',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <Card.Body style={{ padding: '1.5rem' }}>
                <h6 style={{ fontWeight: '600', marginBottom: '1rem' }}>
                  <i className="bi bi-info-circle me-2" style={{ color: '#2c5282' }}></i>
                  Course Details
                </h6>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Difficulty</span>
                    <Badge style={{
                      backgroundColor: getDifficultyColor(course?.difficulty),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px'
                    }}>
                      {course?.difficulty}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Duration</span>
                    <span style={{ fontWeight: '500' }}>{course?.duration || 'Self-paced'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Price</span>
                    <span style={{
                      fontWeight: '600',
                      color: course?.is_free ? '#10b981' : '#2c5282'
                    }}>
                      {course?.is_free ? 'Free' : `$${course?.price}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Updated</span>
                    <span style={{ fontWeight: '500' }}>
                      {course?.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </>
  );
}

export default CourseDetail;