import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axiosConfig';

function Login() {
  // Mode: 'login', 'forgot-request', 'forgot-reset'
  const [mode, setMode] = useState('login');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    new_password: ''
  });

  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setMsg(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // -------------------------
  // STANDARD LOGIN FLOW
  // -------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      const response = await axios.post('/api/auth/login/', {
        email: formData.email,
        password: formData.password
      });
      const token = response.data?.token;

      if (!token) {
        setError("Login failed: Server did not return a token.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));
      window.dispatchEvent(new Event("storage"));
      navigate("/");

    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // FORGOT PASSWORD REQUEST
  // -------------------------
  const handleRequestResetOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/forgot-password-otp/', { email: formData.email });
      setMsg(res.data.message || 'OTP sent to your email.');
      setMode('forgot-reset'); // Move to Reset form
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // FORGOT PASSWORD EXECUTION
  // -------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/reset-password/', {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.new_password
      });
      setMsg('Password reset successful! You can now log in.');
      setMode('login');
      setFormData({...formData, password: '', otp: '', new_password: ''}); // Clear secrets
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Check OTP and password rules.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 p-md-5">

              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
                </h2>
                <p className="text-muted">
                  {mode === 'login' ? 'Sign in to track your progress' : 'Recover your account access'}
                </p>
              </div>

              {msg && <Alert variant="success" className="rounded-3 small">{msg}</Alert>}
              {error && <Alert variant="danger" className="rounded-3 small">{error}</Alert>}

              {/* ================================== */}
              {/* VIEW 1: LOGIN FORM                 */}
              {/* ================================== */}
              {mode === 'login' && (
                <Form onSubmit={handleLoginSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Email Address</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between">
                       <Form.Label className="small fw-medium">Password</Form.Label>
                       <span
                         className="small text-primary"
                         style={{ cursor: 'pointer' }}
                         onClick={() => {setMode('forgot-request'); setError(''); setMsg('');}}
                       >
                         Forgot?
                       </span>
                    </div>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-medium" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </Form>
              )}

              {/* ================================== */}
              {/* VIEW 2: FORGOT PASSWORD - GET OTP  */}
              {/* ================================== */}
              {mode === 'forgot-request' && (
                <Form onSubmit={handleRequestResetOTP}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium">Registered Email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
                  </Form.Group>
                  <Button variant="warning" type="submit" className="w-100 py-2 fw-medium" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset OTP'}
                  </Button>
                  <div className="text-center mt-3">
                     <Button variant="link" className="text-muted small p-0" onClick={() => setMode('login')}>Back to Login</Button>
                  </div>
                </Form>
              )}

              {/* ================================== */}
              {/* VIEW 3: FORGOT PASSWORD - SET NEW  */}
              {/* ================================== */}
              {mode === 'forgot-reset' && (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium text-muted">Email</Form.Label>
                    <Form.Control type="email" value={formData.email} disabled className="bg-light" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">6-Digit OTP</Form.Label>
                    <Form.Control type="text" name="otp" value={formData.otp} onChange={handleChange} maxLength="6" required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium">New Password</Form.Label>
                    <Form.Control type="password" name="new_password" value={formData.new_password} onChange={handleChange} required />
                    <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Min 8 chars, 1 uppercase, 1 number, 1 special character.
                    </Form.Text>
                  </Form.Group>

                  <Button variant="success" type="submit" className="w-100 py-2 fw-medium" disabled={loading}>
                    {loading ? 'Resetting...' : 'Set New Password'}
                  </Button>
                  <div className="text-center mt-3">
                     <Button variant="link" className="text-muted small p-0" onClick={() => setMode('login')}>Cancel</Button>
                  </div>
                </Form>
              )}

              {/* Only show signup link on the main login view */}
              {mode === 'login' && (
                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    Don't have an account? <Link to="/signup" className="fw-medium text-primary text-decoration-none">Sign up here</Link>
                  </p>
                </div>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;