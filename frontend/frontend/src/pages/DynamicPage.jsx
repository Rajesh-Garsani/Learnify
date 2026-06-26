import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import axios from '../axiosConfig';

function DynamicPage({ slug }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/pages/${slug}/`);
        setPageData(res.data);
      } catch (err) {
        setError("This page is currently being updated or does not exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" style={{ color: 'var(--brand-primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center py-5">
        <h3 className="text-muted">{error}</h3>
      </Container>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="bg-white border-bottom py-5 mb-5 shadow-sm">
        <Container>
          <h1 className="fw-bold display-5 mb-2" style={{ color: 'var(--text-main)' }}>{pageData.title}</h1>
          <p className="text-muted mb-0">Last Updated: {pageData.last_updated}</p>
        </Container>
      </div>

      <Container>
        <Card className="border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: '16px' }}>
          {/* dangerouslySetInnerHTML renders the CKEditor HTML formatting from Django admin safely */}
          <Card.Body
            className="text-muted dynamic-content"
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: pageData.content }}
          />
        </Card>
      </Container>
    </div>
  );
}

export default DynamicPage;