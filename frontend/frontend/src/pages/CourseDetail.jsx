import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Spinner, Alert, Button, Badge } from 'react-bootstrap';
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
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false); // NEW

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

  const handlePopupLogin = () => navigate('/login');
  const handleStartLearning = () => {
    if (topics.length > 0) navigate(`/topic/${topics[0].id}`);
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Limit topics
  const displayedTopics = showAllTopics ? topics : topics.slice(0, 5);
  const hasMoreTopics = topics.length > 5;

  // Check if description is long (>300 chars)
  const descriptionLength = course?.description?.length || 0;
  const isLongDescription = descriptionLength > 300;

  if (loading) return (
    <Container className="my-5 py-5 text-center" style={{ minHeight: '60vh' }}>
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">Loading course details...</p>
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
    <>
      {showLoginPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="modern-card p-4 text-center" style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', color: 'white', fontSize: '1.75rem',
              boxShadow: '0 10px 15px -3px rgba(13, 148, 136, 0.3)'
            }}>
              <i className="bi bi-lock-fill"></i>
            </div>
            <h4 className="fw-bold mb-3" style={{ color: 'var(--text-main)' }}>Unlock Your Learning Journey!</h4>
            <p className="text-muted mb-4">Login to track your progress, save your history, and earn certificates as you learn.</p>
            <div className="d-flex flex-column gap-2">
              <Button onClick={handlePopupLogin} className="btn-primary w-100 py-2">
                <i className="bi bi-box-arrow-in-right me-2"></i> Login Now
              </Button>
              <Button variant="light" onClick={() => setShowLoginPopup(false)} className="w-100 py-2 fw-medium border">
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      )}

      <Container className="mt-4 pb-5">
        <div className="mb-4 small fw-medium">
          <Link to="/" className="text-muted text-decoration-none"><i className="bi bi-house me-1"></i> Home</Link>
          <span className="mx-2 text-muted">/</span>
          <Link to="/courses" className="text-muted text-decoration-none">Courses</Link>
          <span className="mx-2 text-muted">/</span>
          <span style={{ color: 'var(--brand-primary)' }}>{course?.title}</span>
        </div>

        <Row className="g-4">
          {/* Main content – order: on mobile (order-2), on large (order-1) */}
          <Col lg={8} xs={12} className="order-2 order-lg-1">
            {/* Hero Banner – responsive */}
            <div style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              borderRadius: '16px', padding: '2rem 1.5rem',
              color: 'white', marginBottom: '2rem',
              boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.4)'
            }} className="hero-banner">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-4">
                <div className="flex-grow-1">
                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <Badge bg="transparent" className="border border-white text-white rounded-pill px-3 py-2 text-capitalize">{course?.difficulty}</Badge>
                    <Badge style={{ background: course?.is_free ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)', color: 'white', borderRadius: '50px' }} className="px-3 py-2">
                      {course?.is_free ? 'Free' : `$${course?.price}`}
                    </Badge>
                  </div>
                  <h1 className="fw-bolder mb-3 display-6 course-title">{course?.title}</h1>
                  {course?.short_description && (
                    <div className="mb-4 text-white-50 fs-5 course-short-desc" dangerouslySetInnerHTML={{ __html: course.short_description }} />
                  )}
                  <div className="d-flex gap-4 flex-wrap text-white-50 fw-medium course-meta">
                    <div><i className="bi bi-clock me-2"></i>{course?.duration || 'Self-paced'}</div>
                    {course?.rating && <div><i className="bi bi-star-fill text-warning me-2"></i>{course.rating}/5.0</div>}
                  </div>
                </div>
                <div className="text-md-end w-100 w-md-auto">
                  <Button onClick={handleStartLearning} className="btn btn-light fw-bold px-4 py-3 rounded-3 start-btn" style={{ color: '#ffffff' }}>
                    <i className="bi bi-play-circle-fill me-2"></i> Start Learning
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs – responsive */}
            <div className="d-flex border-bottom mb-4 overflow-auto flex-nowrap gap-1 tab-wrapper">
              {['overview', 'syllabus', 'instructor'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`bg-transparent border-0 py-3 px-3 px-sm-4 fw-semibold text-capitalize transition-all tab-btn`}
                  style={{
                    borderBottom: activeTab === tab ? '3px solid var(--brand-primary)' : '3px solid transparent',
                    color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}
                >
                  {tab === 'syllabus' ? `Syllabus (${topics.length})` : tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <Card className="modern-card border-0 mb-4">
                <Card.Body className="p-4 p-md-5">
                  <h4 className="fw-bold mb-4" style={{ color: 'var(--text-main)' }}>About This Course</h4>
                  <div className="text-muted lh-lg course-description">
                    {isLongDescription ? (
                      <>
                        <div dangerouslySetInnerHTML={{ __html: showFullDescription ? course.description : course.description.slice(0, 300) + '...' }} />
                        <Button
                          variant="link"
                          className="p-0 mt-2 fw-bold"
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}
                        >
                          {showFullDescription ? 'Show Less' : 'View Complete Description'}
                        </Button>
                      </>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: course?.description }} />
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}

            {activeTab === 'syllabus' && (
              <Card className="modern-card border-0 mb-4">
                <Card.Header className="bg-white border-bottom p-4">
                  <h5 className="fw-bold m-0" style={{ color: 'var(--text-main)' }}>Course Curriculum</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {topics.length > 0 ? (
                    <>
                      {displayedTopics.map((topic, index) => {
                        const isCompleted = completedIds.includes(topic.id);
                        return (
                          <ListGroup.Item
                            key={topic.id} as={Link} to={`/topic/${topic.id}`}
                            className="d-flex justify-content-between align-items-center p-4 border-bottom transition-all text-decoration-none"
                            style={{ background: isCompleted ? 'rgba(13, 148, 136, 0.03)' : 'white' }}
                          >
                            <div className="d-flex align-items-center flex-grow-1 me-3">
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: isCompleted ? '#10b981' : 'var(--bg-color)',
                                color: isCompleted ? 'white' : 'var(--brand-primary)',
                                border: isCompleted ? 'none' : '1px solid #e2e8f0'
                              }} className="d-flex align-items-center justify-content-center fw-bold me-3 flex-shrink-0">
                                {isCompleted ? <i className="bi bi-check-lg fs-5"></i> : index + 1}
                              </div>
                              <div>
                                <div className="fw-bold text-dark mb-1 topic-title">{topic.title}</div>
                                {topic.description && <small className="text-muted d-block line-clamp-1 topic-desc">{stripHtml(topic.description)}</small>}
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3 flex-shrink-0">
                              {topic.duration && <small className="text-muted d-none d-sm-block"><i className="bi bi-clock me-1"></i>{topic.duration}</small>}
                              <i className={`bi fs-4 ${isCompleted ? 'bi-check-circle-fill text-success' : 'bi-play-circle text-primary'}`} style={{ color: isCompleted ? '' : 'var(--brand-primary)' }}></i>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                      {hasMoreTopics && (
                        <ListGroup.Item className="text-center border-0 p-3">
                          <Button
                            variant="outline-primary"
                            onClick={() => setShowAllTopics(!showAllTopics)}
                            className="px-4"
                          >
                            {showAllTopics ? 'Show Less' : `View All Topics (${topics.length})`}
                          </Button>
                        </ListGroup.Item>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-5 text-muted">
                      <i className="bi bi-folder-x display-4 text-light mb-3 d-block"></i>
                      <p>No topics available yet.</p>
                    </div>
                  )}
                </ListGroup>
              </Card>
            )}

            {activeTab === 'instructor' && (
              <Card className="modern-card border-0 mb-4">
                <Card.Body className="p-4 p-md-5">
                  <div className="d-flex gap-4 align-items-center flex-wrap flex-sm-nowrap">
                    <div style={{
                      width: '90px', height: '90px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0
                    }}>
                      {course?.instructor?.name?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <h4 className="fw-bold mb-2 instructor-name">{course?.instructor?.name || 'Learnify Expert'}</h4>
                      <p className="text-muted mb-3 instructor-bio">{course?.instructor?.bio || 'Professional instructor focused on delivering high-quality, practical tech education.'}</p>
                      <div className="d-flex gap-3 text-muted small fw-medium flex-wrap">
                        <span><i className="bi bi-award me-1 text-primary"></i> Certified Expert</span>
                        <span><i className="bi bi-chat-left-text me-1 text-primary"></i> Q&A Supported</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Sidebar – order: on mobile (order-1), on large (order-2) */}
          <Col lg={4} xs={12} className="order-1 order-lg-2">
            <Row className="g-3">
              {/* Progress Card */}
              {token && progress && (
                <Col lg={6} xs={12}>
                  <Card className="modern-card border-0 h-100">
                    <Card.Header className="bg-white border-bottom p-3">
                      <h6 className="fw-bold m-0"><i className="bi bi-graph-up me-2" style={{ color: 'var(--brand-primary)' }}></i> Progress</h6>
                    </Card.Header>
                    <Card.Body className="p-3 text-center">
                      <div style={{
                        width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem',
                        background: `conic-gradient(var(--brand-primary) ${progress.progress_percent * 3.6}deg, #e2e8f0 0deg)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                      }}>
                        <div style={{
                          width: '85px', height: '85px', backgroundColor: 'white', borderRadius: '50%',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span className="fs-4 fw-bold" style={{ color: 'var(--brand-primary)' }}>{progress.progress_percent}%</span>
                          <span className="text-muted small fw-medium">Complete</span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-around mb-3 small">
                        <div><span className="fw-bold text-dark">{progress.completed_topics || 0}</span> done</div>
                        <div><span className="fw-bold text-dark">{progress.total_topics || topics.length}</span> total</div>
                      </div>
                      <Button onClick={handleStartLearning} className="btn-primary w-100 py-2" size="sm">
                        <i className="bi bi-play-circle-fill me-1"></i> {progress.progress_percent === 0 ? 'Start' : 'Continue'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {/* Course Details Card – always visible */}
              <Col lg={token && progress ? 6 : 12} xs={12}>
                <Card className="modern-card border-0 h-100">
                  <Card.Header className="bg-white border-bottom p-3">
                    <h6 className="fw-bold m-0"><i className="bi bi-info-circle-fill me-2" style={{ color: 'var(--brand-primary)' }}></i> Details</h6>
                  </Card.Header>
                  <Card.Body className="p-3">
                    <div className="d-flex flex-column gap-2 small">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Difficulty</span>
                        <Badge bg="transparent" className="border text-dark text-capitalize px-3 py-1 rounded-pill">{course?.difficulty}</Badge>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Duration</span>
                        <span className="fw-bold">{course?.duration || 'Self-paced'}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Price</span>
                        <span className="fw-bold" style={{ color: course?.is_free ? '#10b981' : 'var(--text-main)' }}>
                          {course?.is_free ? 'Free' : `$${course?.price}`}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Updated</span>
                        <span className="fw-bold text-dark">{course?.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <style>{`
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

        /* Responsive adjustments for mobile */
        @media (max-width: 576px) {
          .hero-banner {
            padding: 1.5rem 1rem !important;
          }
          .course-title {
            font-size: 1.5rem !important;
          }
          .course-short-desc {
            font-size: 0.9rem !important;
          }
          .course-meta {
            font-size: 0.8rem !important;
          }
          .start-btn {
            font-size: 0.9rem !important;
            padding: 0.6rem 1.2rem !important;
          }
          .tab-btn {
            font-size: 0.75rem !important;
            padding: 0.6rem 0.8rem !important;
          }
          .course-description {
            font-size: 0.9rem !important;
          }
          .topic-title {
            font-size: 0.85rem !important;
          }
          .topic-desc {
            font-size: 0.7rem !important;
          }
          .instructor-name {
            font-size: 1.2rem !important;
          }
          .instructor-bio {
            font-size: 0.85rem !important;
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .course-title {
            font-size: 2rem !important;
          }
          .start-btn {
            padding: 0.7rem 1.5rem !important;
          }
        }
      `}</style>
    </>
  );
}

export default CourseDetail;