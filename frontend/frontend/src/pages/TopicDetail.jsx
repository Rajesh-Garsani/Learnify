import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Offcanvas } from 'react-bootstrap';
import axios from '../axiosConfig';
import Prism from '../prism-setup';

function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [topic, setTopic] = useState(null);
  const [courseTopics, setCourseTopics] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);

  // New state for mobile topic sidebar
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    loadTopicData();
    window.scrollTo(0, 0);
  }, [topicId]);

  useEffect(() => {
    if (topic && topic.content) {
      const timer = setTimeout(() => {
        if (window.Prism) {
            window.Prism.highlightAll();
        } else {
            Prism.highlightAll();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [topic]);

  const loadTopicData = async () => {
    setLoading(true);
    try {
      const tRes = await axios.get(`/api/topics/${topicId}/`);
      setTopic(tRes.data);
      const courseId = tRes.data.course;

      try {
        const courseRes = await axios.get(`/api/courses/${courseId}/`);
        setCourse(courseRes.data);
      } catch (err) {
        console.error("Failed to load course info:", err);
      }

      const listRes = await axios.get(`/api/topics/?course=${courseId}`);
      const listData = listRes.data.results || listRes.data;
      setCourseTopics(Array.isArray(listData) ? listData : []);

      if (token) {
        try {
          const idToSend = parseInt(topicId, 10);
          await axios.post('/api/progress/', { topic_id: idToSend });
        } catch (trackErr) {
          console.error("Failed to track progress:", trackErr);
        }

        try {
          const timestamp = new Date().getTime();
          const progRes = await axios.get(`/api/progress/course/${courseId}/?t=${timestamp}`);
          setProgress(progRes.data);
          if (progRes.data.completed_topic_ids) {
            setCompletedIds(progRes.data.completed_topic_ids);
          }
        } catch (err) {
          console.error("Failed to load progress", err);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Container className="my-5 py-5 text-center">
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      <p className="mt-3 text-muted">Loading topic content...</p>
    </Container>
  );

  if (!topic) return (
    <Container className="my-5 py-5 text-center">
      <Alert variant="danger" className="mx-auto" style={{ maxWidth: '600px', borderRadius: '12px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i> Topic not found.
      </Alert>
      <Button as={Link} to="/courses" className="btn-primary mt-3">
        <i className="bi bi-arrow-left me-2"></i> Back to Courses
      </Button>
    </Container>
  );

  const currentIdInt = parseInt(topicId);
  const currentIndex = courseTopics.findIndex(t => t.id === currentIdInt);
  const prevTopic = currentIndex > 0 ? courseTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < courseTopics.length - 1 ? courseTopics[currentIndex + 1] : null;

  // Reusable Topic List Component for both Desktop Sidebar & Mobile Offcanvas
  const TopicList = () => (
    <div style={{ padding: '0.5rem', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
      {courseTopics.map((t, idx) => {
        const isActive = t.id === currentIdInt;
        const isCompleted = completedIds.includes(t.id);
        return (
          <Link
            key={t.id}
            to={`/topic/${t.id}`}
            onClick={() => setShowMobileSidebar(false)} // Close mobile sidebar on click
            className="d-flex align-items-center p-3 mb-2 rounded-3 text-decoration-none transition-all"
            style={{
              background: isActive ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' : (isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent'),
              color: isActive ? 'white' : 'var(--text-main)',
              border: isActive ? 'none' : '1px solid transparent'
            }}
          >
            <div style={{ width: '28px', height: '28px', background: isActive ? 'rgba(255,255,255,0.2)' : (isCompleted ? '#10b981' : 'var(--bg-color)'), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive || isCompleted ? 'white' : 'var(--brand-primary)', fontWeight: '500', marginRight: '0.75rem', fontSize: '0.8rem', flexShrink: 0 }}>
              {isCompleted ? <i className="bi bi-check"></i> : idx + 1}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: isActive ? '600' : '500', flex: 1 }}>{t.title}</div>
            {isActive && <i className="bi bi-chevron-right text-white ms-2"></i>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <Container fluid className="pb-5" style={{ marginTop: '2rem' }}>
      <Row>
        {/* DESKTOP SIDEBAR */}
        <Col lg={3} className="d-none d-lg-block">
          <div style={{ position: 'sticky', top: '80px', height: 'calc(100vh - 100px)', overflowY: 'auto', paddingRight: '15px' }}>
            {course && (
              <Card className="modern-card border-0 mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginRight: '0.75rem', flexShrink: 0 }}>
                      <i className="bi bi-book"></i>
                    </div>
                    <div className="flex-grow-1">
                      <Link to={`/course/${topic.course}`} className="text-decoration-none fw-bold" style={{ color: 'var(--brand-primary)', fontSize: '0.95rem' }}>
                        {course.title}
                      </Link>
                      <small className="text-muted d-block" style={{ fontSize: '0.85rem' }}>{courseTopics.length} topics</small>
                    </div>
                  </div>
                  {progress && (
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Progress</small>
                        <small className="fw-bold" style={{ color: 'var(--brand-primary)' }}>{progress.progress_percent}%</small>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: `${progress.progress_percent}%`, background: 'var(--brand-primary)' }}></div>
                      </div>
                    </div>
                  )}
                  <Button as={Link} to={`/course/${topic.course}`} variant="outline-primary" className="w-100 py-2">
                    <i className="bi bi-arrow-left me-1"></i> Course Overview
                  </Button>
                </Card.Body>
              </Card>
            )}

            <div className="modern-card border-0 overflow-hidden">
              <div className="bg-light p-3 border-bottom">
                <h6 className="mb-0 fw-bold"><i className="bi bi-list-check me-2" style={{ color: 'var(--brand-primary)' }}></i> Course Topics</h6>
              </div>
              <TopicList />
            </div>
          </div>
        </Col>

        {/* MAIN CONTENT */}
        <Col lg={9} md={12}>

          {/* MOBILE HEADER & HAMBURGER MENU */}
          <div className="d-lg-none d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm border">
            <Link to={`/course/${topic.course}`} className="text-muted text-decoration-none fw-medium">
              <i className="bi bi-arrow-left me-2"></i> Course
            </Link>
            <Button variant="outline-primary" size="sm" onClick={() => setShowMobileSidebar(true)} className="fw-bold d-flex align-items-center">
              <i className="bi bi-list fs-5 me-1"></i> Topics
            </Button>
          </div>

          {/* MOBILE OFFCANVAS (Slide out menu) */}
          <Offcanvas show={showMobileSidebar} onHide={() => setShowMobileSidebar(false)} placement="start">
            <Offcanvas.Header closeButton className="border-bottom">
              <Offcanvas.Title className="fw-bold" style={{ color: 'var(--brand-primary)' }}>
                Course Curriculum
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <TopicList />
            </Offcanvas.Body>
          </Offcanvas>

          {/* TOPIC CONTENT CARD */}
          <Card className="modern-card border-0 overflow-hidden">
            <div style={{ background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.05), rgba(15, 118, 110, 0.05))', padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
                    <Badge style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', px: 3, py: 2 }}>
                      Topic {currentIndex + 1} of {courseTopics.length}
                    </Badge>
                    {completedIds.includes(currentIdInt) && <Badge bg="success"><i className="bi bi-check-circle me-1"></i> Completed</Badge>}
                  </div>
                  <h1 className="fw-bolder mb-2" style={{ color: 'var(--text-main)', fontSize: '2rem' }}>{topic.title}</h1>
                  {topic.description && <p className="text-muted m-0 fs-6">{topic.description}</p>}
                </div>
              </div>
            </div>

            <div className="p-3 p-md-5 min-vh-50">
              <div className="topic-content" dangerouslySetInnerHTML={{ __html: topic.content }} style={{ lineHeight: '1.8', fontSize: '1.05rem', color: 'var(--text-main)' }} />
              <style>
                {`
                  .topic-content pre { border-radius: 8px; margin: 1.5rem 0; padding: 1.25rem; background: #1e293b; color: #f8f8f2; overflow-x: auto; font-size: 0.9rem; }
                  .topic-content code { font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 0.9rem; }
                  .topic-content h2 { color: var(--brand-primary); margin-top: 2.5rem; margin-bottom: 1rem; font-weight: 700; }
                  .topic-content h3 { color: var(--brand-secondary); margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; }
                  .topic-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
                  .topic-content blockquote { border-left: 4px solid var(--brand-primary); padding-left: 1rem; margin: 1.5rem 0; color: var(--text-muted); font-style: italic; background: #f8fafc; padding: 1rem; border-radius: 0 8px 8px 0; }
                `}
              </style>
            </div>

            {/* RESPONSIVE BOTTOM NAVIGATION (Fixed for mobile) */}
            {/* RESPONSIVE BOTTOM NAVIGATION (Identical Green Buttons) */}
            <div className="bg-light p-3 p-md-4 border-top">
              <div className="d-flex justify-content-between align-items-center gap-2">

                {/* Previous Button Wrapper */}
                <div className="text-start">
                  {prevTopic && (
                    <Button as={Link} to={`/topic/${prevTopic.id}`} className="btn-primary nav-btn-responsive fw-bold d-flex align-items-center justify-content-center">
                      <i className="bi bi-chevron-left me-1 me-md-2"></i>
                      <span>Prev<span className="d-none d-sm-inline">ious</span></span>
                    </Button>
                  )}
                </div>

                {/* Progress Text - Desktop Only */}
                <div className="text-center d-none d-md-block px-3 flex-grow-1">
                  <div className="text-muted small mb-1">Course Progress</div>
                  <div className="fw-bold fs-5" style={{ color: 'var(--brand-primary)' }}>
                    {Math.round((currentIndex + 1) / courseTopics.length * 100)}%
                  </div>
                </div>

                {/* Next Button Wrapper */}
                <div className="text-end">
                  {nextTopic ? (
                    <Button as={Link} to={`/topic/${nextTopic.id}`} className="btn-primary nav-btn-responsive fw-bold d-flex align-items-center justify-content-center">
                      <span>Next<span className="d-none d-sm-inline"> Topic</span></span>
                      <i className="bi bi-chevron-right ms-1 ms-md-2"></i>
                    </Button>
                  ) : (
                    <Button as={Link} to={`/course/${topic.course}`} variant="success" className="nav-btn-responsive fw-bold text-white shadow-sm d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }}>
                      <i className="bi bi-check-circle me-1 me-md-2"></i>
                      <span>Finish<span className="d-none d-sm-inline"> Course</span></span>
                    </Button>
                  )}
                </div>

              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TopicDetail;