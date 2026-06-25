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

  // ⭐ FIX: Helper to strip HTML tags for search result snippets
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


      <div className="search-filters mb-4">
        <div className="d-flex flex-wrap gap-2">
          {filters.map(filter => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className="d-flex align-items-center"
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
              <h5>
                Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                {query && ` for "${query}"`}
              </h5>
            </div>

            {filteredResults.length > 0 ? (
              <Row xs={1} md={2} lg={3} className="g-4">
                {filteredResults.map((item, index) => (
                  <Col key={`${item.type}-${item.id}-${index}`}>
                    <Card
                      className="h-100 search-result-card"
                      onClick={() => navigateToResult(item)}
                    >
                      <Card.Body>
                        <div className="d-flex align-items-start mb-3">
                          <div className="search-result-icon me-3">
                            <i className={`bi ${getIconForType(item.type)}`}></i>
                          </div>
                          <div>
                            <span className={`badge bg-${getBadgeColor(item.type)} mb-2`}>
                              {item.type}
                            </span>
                            <Card.Title className="h6 mb-2">{item.title}</Card.Title>
                          </div>
                        </div>
                        {item.subtitle && (
                          <Card.Subtitle className="mb-2 text-muted">
                            {item.subtitle}
                          </Card.Subtitle>
                        )}
                        {/* ⭐ FIX: Applied stripHtml so search snippets display cleanly */}
                        {item.snippet && (
                          <Card.Text className="text-muted small">
                            {stripHtml(item.snippet).slice(0, 150)}...
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
                  <i className="bi bi-search"></i>
                </div>
                <h4>No results found for "{query}"</h4>
                <p className="text-muted">Try different keywords or check your spelling</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <div className="initial-state-icon mb-3">
              <i className="bi bi-search"></i>
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
    </Container>
  );
}

export default SearchPage;