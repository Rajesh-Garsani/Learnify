import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import queryString from "query-string";
import axios from '../axiosConfig';

function useQuery() {
  const { search } = useLocation();
  return queryString.parse(search);
}

export default function SearchResults() {
  const q = useQuery().q || "";
  const [results, setResults] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (!q) {
      setResults([]);
      setCount(0);
      return;
    }
    fetchResults(q, page);
  }, [q, page]);

  const fetchResults = async (query, pageNum = 1) => {
    try {
      const res = await axios.get(`/api/search/?q=${encodeURIComponent(query)}&page=${pageNum}&page_size=12`);
      setResults(res.data.results || []);
      setCount(res.data.count || 0);
    } catch (err) {
      setResults([]);
      setCount(0);
    }
  };

  const openResult = (r) => {
    if (r.type === "course") navigate(`/course/${r.id}`);
    else if (r.type === "topic") navigate(`/topic/${r.id}`);
    else if (r.type === "category") navigate(`/category/${r.id}`);
    else if (r.type === "subcategory") navigate(`/subcategory/${r.id}`);
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

  return (
    <Container className="py-4">
      <h2 className="mb-4">Search results for “{q}” ({count})</h2>
      {results.length === 0 && <div>No results found.</div>}
      <Row xs={6} sm={6} md={4} lg={3} className="g-3">
        {results.map((r) => (
          <Col key={`${r.type}-${r.id}`}>
            <Card
              className="h-100 shadow-sm border-0 transition-hover"
              onClick={() => openResult(r)}
              style={{ borderRadius: '12px', cursor: 'pointer', overflow: 'hidden' }}
            >
              <Card.Body className="p-3 d-flex flex-column gap-1">
                <Badge bg={getBadgeColor(r.type)} className="text-uppercase align-self-start" style={{ fontSize: '0.6rem' }}>
                  {r.type}
                </Badge>
                <Card.Title className="fw-bold mb-1 line-clamp-2" style={{ fontSize: '0.9rem' }}>
                  {r.title}
                </Card.Title>
                {r.subtitle && (
                  <Card.Subtitle className="text-muted small line-clamp-1">
                    {r.subtitle}
                  </Card.Subtitle>
                )}
                {r.snippet && (
                  <Card.Text className="text-muted small line-clamp-2 mb-0">
                    {r.snippet}
                  </Card.Text>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="d-flex gap-2 mt-4">
        {page > 1 && <button className="btn btn-outline-primary" onClick={() => setPage(p => p - 1)}>Previous</button>}
        {results.length > 0 && <button className="btn btn-outline-primary" onClick={() => setPage(p => p + 1)}>Next</button>}
      </div>
    </Container>
  );
}
