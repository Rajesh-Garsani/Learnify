import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';

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
          <Row className="g-4">
            {categories.map((category) => (
              <Col xs={4} sm={6} md={4} lg={3} key={category.id}>
                <Card className="h-100 shadow-sm border-0 category-card">

                  {/* Image – hidden on extra‑small screens */}
                  {category.image && (
                    <div className="d-none d-sm-block" style={{ height: '160px', overflow: 'hidden', backgroundColor: '#e9ecef' }}>
                      <Card.Img
                        variant="top"
                        src={category.image}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      />
                    </div>
                  )}

                  <Card.Body className="d-flex flex-column p-3 p-md-4 flex-grow-1">
                    <Card.Title className="fw-bold mb-3 text-dark card-title-responsive">
                      {category.name}
                    </Card.Title>

                    {/* Safely render HTML from CKEditor, clamped to 3 lines */}
                    {category.description && (
                      <div
                        className="text-muted small mb-4 flex-grow-1 line-clamp-3 card-desc-responsive"
                        dangerouslySetInnerHTML={{ __html: category.description }}
                      />
                    )}

                    {/* Action Button – smaller on mobile, text changed, arrow removed */}
                    <Button
                      as={Link}
                      to={`/category/${category.id}`}
                      variant="outline-primary"
                      className="mt-auto w-100 fw-bold rounded-3 btn-responsive"
                    >
                      View All Courses
                    </Button>
                  </Card.Body>

                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <style>{`
        .category-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Responsive text & button sizing */
        @media (max-width: 576px) {
          .card-title-responsive {
            font-size: 0.85rem !important;
          }
          .card-desc-responsive {
            font-size: 0.75rem !important;
          }
          .btn-responsive {
            font-size: 0.7rem !important;      /* even smaller on mobile */
            padding: 0.25rem 0.4rem !important; /* reduced padding */
          }
          .card-body {
            padding: 0.75rem !important;
          }
        }

        @media (min-width: 577px) and (max-width: 768px) {
          .card-title-responsive {
            font-size: 0.95rem !important;
          }
          .card-desc-responsive {
            font-size: 0.8rem !important;
          }
          .btn-responsive {
            font-size: 0.8rem !important;
            padding: 0.4rem 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllCategories;