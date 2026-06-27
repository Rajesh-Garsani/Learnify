import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import axios from '../axiosConfig';

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  const filters = [
    { key: 'all', label: 'All', icon: 'bi-grid' },
    { key: 'course', label: 'Courses', icon: 'bi-play-circle' },
    { key: 'topic', label: 'Topics', icon: 'bi-book' },
    { key: 'category', label: 'Categories', icon: 'bi-folder' },
  ];

  useEffect(() => {
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);

    try {
      const res = await axios.get(`/api/search/?q=${encodeURIComponent(searchQuery.trim())}&page_size=20`);
      setResults(res.data.results || []);
    } catch (err) {
      setResults([]);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter(item => item.type === activeFilter);

  const getIconForType = (type) => {
    switch (type) {
      case 'course': return 'bi-play-circle';
      case 'topic': return 'bi-book';
      case 'category': return 'bi-folder';
      case 'subcategory': return 'bi-folder2';
      default: return 'bi-file-earmark';
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'course': return 'primary';
      case 'topic': return 'success';
      case 'category': return 'warning';
      case 'subcategory': return 'info';
      default: return 'secondary';
    }
  };

  const navigateToResult = (item) => {
    switch (item.type) {
      case 'course':
        navigate(`/course/${item.id}`);
        break;
      case 'topic':
        navigate(`/topic/${item.id}`);
        break;
      case 'category':
        navigate(`/category/${item.id}`);
        break;
      case 'subcategory':
        navigate(`/subcategory/${item.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <Container className="search-page py-5">
      <div className="mb-4">
        <Form onSubmit={handleSearch}>
          <InputGroup size="lg" className="shadow-sm rounded-3 overflow-hidden">
            <Form.Control
              id="main-search-input"
              type="search"
              placeholder="Search for courses, topics, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="shadow-none border-0"
            />
            <Button variant="primary" type="submit" className="px-4">
              <i className="bi bi-search me-1"></i> Search
            </Button>
          </InputGroup>
        </Form>
      </div>

      <div className="search-filters mb-4">
        <div className="d-flex flex-wrap gap-2">
          {filters.map(filter => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className="d-flex align-items-center rounded-pill px-3"
            >
              <i className={`bi ${filter.icon} me-1`}></i>
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Searching for "{query}"...</p>
          </div>
        ) : hasSearched ? (
          <>
            <div className="results-count mb-4">
              <h5 className="fw-bold">
                Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                {query && ` for "${query}"`}
              </h5>
            </div>

            {filteredResults.length > 0 ? (
              <Row xs={6} sm={6} md={4} lg={3} className="g-2 g-md-3 g-lg-4">
                {filteredResults.map((item, index) => (
                  <Col key={`${item.type}-${item.id}-${index}`}>
                    <Card
                      className="h-100 shadow-sm border-0 transition-hover"
                      onClick={() => navigateToResult(item)}
                      style={{ borderRadius: '12px', cursor: 'pointer', overflow: 'hidden' }}
                    >
                      <Card.Body className="p-2 p-md-3 p-lg-4 d-flex flex-column gap-1 gap-md-2">
                        <div className="d-flex align-items-start">
                          <div className="search-result-icon me-2 flex-shrink-0 d-none d-sm-block" style={{ marginTop: '2px' }}>
                            <i className={`bi ${getIconForType(item.type)} fs-5 icon-responsive`} style={{ color: 'var(--brand-primary)' }}></i>
                          </div>
                          <div className="flex-grow-1 min-width-0">
                            <span className={`badge bg-${getBadgeColor(item.type)} mb-1 text-uppercase`} style={{ fontSize: '0.6rem', letterSpacing: '0.02em' }}>
                              {item.type}
                            </span>
                            <Card.Title className="h6 fw-bold mb-1 line-clamp-2 card-title-responsive">
                              {item.title}
                            </Card.Title>
                            {item.subtitle && (
                              <Card.Subtitle className="text-muted small line-clamp-1 card-subtitle-responsive">
                                {item.subtitle}
                              </Card.Subtitle>
                            )}
                          </div>
                        </div>
                        {item.snippet && (
                          <Card.Text className="text-muted small flex-grow-1 line-clamp-2 mb-0 card-desc-responsive">
                            {stripHtml(item.snippet)}
                          </Card.Text>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center py-5">
                <div className="no-results-icon mb-3">
                  <i className="bi bi-search display-1 text-light"></i>
                </div>
                <h4>No results found for "{query}"</h4>
                <p className="text-muted">Try different keywords or check your spelling</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <div className="initial-state-icon mb-3">
              <i className="bi bi-search display-1 text-light"></i>
            </div>
            <h4>Start Searching</h4>
            <p className="text-muted">Enter keywords to find courses, topics, and more</p>
            <div className="mt-4">
              <h6 className="mb-3">Popular Searches</h6>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {['Machine Learning', 'Python', 'AI', 'Data Science', 'Web Development'].map(tag => (
                  <Button
                    key={tag}
                    variant="outline-secondary"
                    size="sm"
                    className="rounded-pill"
                    onClick={() => {
                      setQuery(tag);
                      performSearch(tag);
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .transition-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .transition-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
        .min-width-0 { min-width: 0; }
        @media (max-width: 576px) {
          .card-title-responsive { font-size: 0.8rem !important; }
          .card-desc-responsive { font-size: 0.7rem !important; }
          .card-subtitle-responsive { font-size: 0.65rem !important; }
          .icon-responsive { font-size: 1rem !important; }
          .card-body { padding: 0.5rem !important; }
          .badge { font-size: 0.5rem !important; }
          .gap-1 { gap: 0.15rem !important; }
        }
        @media (min-width: 577px) and (max-width: 768px) {
          .card-title-responsive { font-size: 0.9rem !important; }
          .card-desc-responsive { font-size: 0.75rem !important; }
          .card-subtitle-responsive { font-size: 0.7rem !important; }
        }
      `}</style>
    </Container>
  );
}

export default SearchPage;
