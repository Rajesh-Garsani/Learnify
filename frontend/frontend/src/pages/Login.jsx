import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Use the configured axios
import axios from '../axiosConfig';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show success message if redirected from Signup
    if (location.state?.message) {
      setMsg(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login/', formData);
      const token = response.data?.token;

      if (!token) {
        setError("Login failed: Server did not return a token.");
        setLoading(false);
        return;
      }

      // 1. Save Token & User Info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));

      // ⭐ CRITICAL FIX: Notify Navbar that login state changed
      window.dispatchEvent(new Event("storage"));

      // 2. Navigate to Home
      navigate("/");

    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Welcome Back</h2>
                <p className="text-muted">Sign in to track your progress</p>
              </div>

              {msg && <Alert variant="success">{msg}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <p className="text-muted">Don't have an account? <Link to="/signup">Sign up here</Link></p>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;