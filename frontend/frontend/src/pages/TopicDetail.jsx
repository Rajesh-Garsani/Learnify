import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
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

  useEffect(() => {
    loadTopicData();
    window.scrollTo(0, 0);
  }, [topicId]);

  // BUG 3 FIX: Use a timeout to guarantee the DOM is painted with dangerouslySetInnerHTML
  // before Prism attempts to style the plain text.
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
    <Container className="my-5 py-5">
      <div className="text-center">
        <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading topic content...</p>
      </div>
    </Container>
  );

  if (!topic) return (
    <Container className="my-5 py-5">
      <Alert variant="danger" className="text-center" style={{ borderRadius: '8px' }}>
        <i className="bi bi-exclamation-triangle me-2"></i>
        Topic not found.
      </Alert>
      <div className="text-center">
        <Link to="/courses" className="btn btn-primary" style={{
          background: 'linear-gradient(135deg, #2c5282, #4a90e2)',
          border: 'none', borderRadius: '8px', padding: '0.75rem 2rem'
        }}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Courses
        </Link>
      </div>
    </Container>
  );

  const currentIdInt = parseInt(topicId);
  const currentIndex = courseTopics.findIndex(t => t.id === currentIdInt);
  const prevTopic = currentIndex > 0 ? courseTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < courseTopics.length - 1 ? courseTopics[currentIndex + 1] : null;

  return (
    <Container fluid className="mt-0 pb-5">
      <Row>
        <Col lg={3} className="d-none d-lg-block">
          <div style={{ position: 'sticky', top: '80px', height: 'calc(100vh - 100px)', overflowY: 'auto', paddingRight: '15px' }}>
            {course && (
              <Card style={{ border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <Card.Body style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2c5282, #4a90e2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginRight: '0.75rem', flexShrink: 0 }}>
                      <i className="bi bi-book"></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Link to={`/course/${topic.course}`} style={{ color: '#2c5282', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem', display: 'block' }}>
                        {course.title}
                      </Link>
                      <small className="text-muted" style={{ fontSize: '0.85rem' }}>{courseTopics.length} topics</small>
                    </div>
                  </div>
                  {progress && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <small className="text-muted">Progress</small>
                        <small style={{ color: '#2c5282', fontWeight: '500' }}>{progress.progress_percent}%</small>
                      </div>
                      <div style={{ height: '4px', background: '#eaeaea', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress.progress_percent}%`, height: '100%', background: 'linear-gradient(135deg, #2c5282, #4a90e2)', borderRadius: '2px' }}></div>
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.8rem' }}>{progress.completed_topics} of {progress.total_topics} completed</small>
                    </div>
                  )}
                  <Button as={Link} to={`/course/${topic.course}`} variant="outline-primary" size="sm" style={{ width: '100%', borderColor: '#4a90e2', color: '#4a90e2', borderRadius: '8px', fontSize: '0.85rem', padding: '0.5rem' }}>
                    <i className="bi bi-arrow-left me-1"></i> Course Overview
                  </Button>
                </Card.Body>
              </Card>
            )}

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #eaeaea', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #eaeaea', background: '#f8f9fa' }}>
                <h6 className="mb-0 fw-semibold" style={{ fontSize: '0.95rem' }}>
                  <i className="bi bi-list-check me-2" style={{ color: '#2c5282' }}></i> Course Topics
                </h6>
              </div>
              <div style={{ padding: '0.5rem', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                {courseTopics.map((t, idx) => {
                  const isActive = t.id === currentIdInt;
                  const isCompleted = completedIds.includes(t.id);

                  return (
                    <Link
                      key={t.id}
                      to={`/topic/${t.id}`}
                      style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', marginBottom: '0.25rem', borderRadius: '8px', textDecoration: 'none', color: isActive ? 'white' : '#555', background: isActive ? 'linear-gradient(135deg, #2c5282, #4a90e2)' : (isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent'), transition: 'all 0.2s ease', border: isActive ? 'none' : '1px solid transparent', cursor: 'pointer' }}
                      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#e0e0e0'; } }}
                      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent'; e.currentTarget.style.borderColor = 'transparent'; } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <div style={{ width: '28px', height: '28px', background: isActive ? 'rgba(255,255,255,0.2)' : (isCompleted ? '#10b981' : '#e8f1ff'), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? 'white' : (isCompleted ? 'white' : '#2c5282'), fontWeight: '500', marginRight: '0.75rem', fontSize: '0.8rem', flexShrink: 0 }}>
                          {isCompleted ? <i className="bi bi-check"></i> : idx + 1}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: isActive ? '500' : '400', flex: 1 }}>{t.title}</div>
                      </div>
                      {isActive && <i className="bi bi-chevron-right" style={{ color: 'white', marginLeft: '0.5rem' }}></i>}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="d-lg-none mt-4">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {prevTopic && <Button as={Link} to={`/topic/${prevTopic.id}`} variant="outline-primary" size="sm" style={{ flex: 1, borderRadius: '8px' }}><i className="bi bi-chevron-left me-1"></i> Previous</Button>}
                {nextTopic ? <Button as={Link} to={`/topic/${nextTopic.id}`} variant="primary" size="sm" style={{ flex: 1, background: 'linear-gradient(135deg, #2c5282, #4a90e2)', border: 'none', borderRadius: '8px' }}>Next <i className="bi bi-chevron-right ms-1"></i></Button> : <Button as={Link} to={`/course/${topic.course}`} variant="success" size="sm" style={{ flex: 1, borderRadius: '8px' }}>Finish</Button>}
              </div>
            </div>
          </div>
        </Col>

        <Col lg={9} md={12}>
          <div className="d-lg-none mb-4" style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', background: 'white', borderRadius: '8px', border: '1px solid #eaeaea' }}>
            <Link to={`/course/${topic.course}`} style={{ color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center' }}><i className="bi bi-arrow-left me-2"></i> Back to Course</Link>
          </div>

          <Card style={{ border: '1px solid #eaeaea', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(44, 82, 130, 0.05), rgba(74, 144, 226, 0.05))', padding: '1.5rem 2rem', borderBottom: '1px solid #eaeaea' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Badge style={{ background: 'linear-gradient(135deg, #2c5282, #4a90e2)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500', marginRight: '0.75rem' }}>
                      Topic {currentIndex + 1} of {courseTopics.length}
                    </Badge>
                    {completedIds.includes(currentIdInt) && <Badge style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}><i className="bi bi-check-circle me-1"></i> Completed</Badge>}
                  </div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#2c5282' }}>{topic.title}</h1>
                  {topic.description && <p style={{ color: '#666', fontSize: '1rem', marginBottom: 0 }}>{topic.description}</p>}
                </div>
                <div className="d-none d-lg-block" style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #2c5282, #4a90e2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {completedIds.includes(currentIdInt) ? <i className="bi bi-check-all"></i> : <i className="bi bi-book"></i>}
                  </div>
                  <small className="text-muted" style={{ fontSize: '0.8rem' }}>{completedIds.includes(currentIdInt) ? 'Completed' : 'In Progress'}</small>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem', minHeight: '60vh' }}>
              <div className="topic-content" dangerouslySetInnerHTML={{ __html: topic.content }} style={{ lineHeight: '1.8', fontSize: '1rem', color: '#333' }} />
              <style>
                {`
                  .topic-content pre { border-radius: 8px; margin: 1.5rem 0; padding: 1rem; background: #1a1a1a; color: #f8f8f2; overflow-x: auto; font-size: 0.9rem; }
                  .topic-content code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 0.9rem; }
                  .topic-content h2 { color: #2c5282; margin-top: 2rem; margin-bottom: 1rem; font-weight: 600; }
                  .topic-content h3 { color: #4a90e2; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 500; }
                  .topic-content p { margin-bottom: 1rem; }
                  .topic-content ul, .topic-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                  .topic-content li { margin-bottom: 0.5rem; }
                  .topic-content blockquote { border-left: 4px solid #4a90e2; padding-left: 1rem; margin: 1.5rem 0; color: #666; font-style: italic; }
                `}
              </style>
            </div>

            <div className="d-none d-lg-block" style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eaeaea', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  {prevTopic && <Button as={Link} to={`/topic/${prevTopic.id}`} variant="outline-primary" style={{ borderColor: '#4a90e2', color: '#4a90e2', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '500' }}><i className="bi bi-chevron-left me-2"></i> Previous Topic</Button>}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.25rem' }}>Progress</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c5282' }}>{Math.round((currentIndex + 1) / courseTopics.length * 100)}%</div>
                  </div>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  {nextTopic ? <Button as={Link} to={`/topic/${nextTopic.id}`} style={{ background: 'linear-gradient(135deg, #2c5282, #4a90e2)', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '500' }}>Next Topic <i className="bi bi-chevron-right ms-2"></i></Button> : <Button as={Link} to={`/course/${topic.course}`} variant="success" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '500' }}><i className="bi bi-check-circle me-2"></i> Finish Course</Button>}
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