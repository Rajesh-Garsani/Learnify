import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories/');
        const data = response.data.results ? response.data.results : response.data;
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', position: 'relative', zIndex: 10 }} className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', position: 'relative', zIndex: 10 }} className="d-flex justify-content-center pt-5">
         <h4 className="text-danger">{error}</h4>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', position: 'relative', zIndex: 10, padding: '4rem 0' }}>
      <Container>

        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="fw-bolder text-dark mb-3">Explore Course Categories</h1>
          <p className="text-muted lead" style={{ maxWidth: '700px', margin: '0 auto' }}>
            Browse through our extensive library of topics. From Python development to React, find the perfect path to elevate your skills.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center text-muted fs-5 py-5">
            No categories found. Check back soon!
          </div>
        ) : (
          /* Bootstrap Grid Layout for Cards */
          <Row className="g-4">
            {categories.map((category) => (
              <Col lg={3} md={4} sm={6} key={category.id}>
                <Card className="h-100 shadow-sm border-0 category-card">

                  {/* Image Placeholder */}
                  {category.image && (
                    <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#e9ecef' }}>
                      <Card.Img
                        variant="top"
                        src={category.image}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      />
                    </div>
                  )}

                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title className="fw-bold mb-3 text-dark">
                      {category.name}
                    </Card.Title>

                    {/* Safely render HTML from CKEditor */}
                    {category.description && (
                      <div
                        className="text-muted small mb-4 flex-grow-1"
                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        dangerouslySetInnerHTML={{ __html: category.description }}
                      />
                    )}

                    {/* Action Link */}
                    <Link
                      to={`/category/${category.id}`}
                      className="mt-auto fw-bold text-decoration-none d-flex align-items-center"
                    >
                      View Courses <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </Card.Body>

                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Inline styles for the card hover effect */}
      <style>{`
        .category-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .category-card:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
      `}</style>
    </div>
  );
};

export default AllCategories;