import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axiosConfig';

function Login() {
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

  const handleRequestResetOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/forgot-password-otp/', { email: formData.email });
      setMsg(res.data.message || 'OTP sent to your email.');
      setMode('forgot-reset');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

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
      setFormData({...formData, password: '', otp: '', new_password: ''});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
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
                <h2 className="fw-bold fs-3 fs-md-2">
                  {mode === 'login' ? 'Welcome Back' : 'Reset Password'}
                </h2>
                <p className="text-muted small mb-0">
                  {mode === 'login' ? 'Sign in to track your progress' : 'Recover your account access'}
                </p>
              </div>

              {msg && <Alert variant="success" className="rounded-3 small py-2">{msg}</Alert>}
              {error && <Alert variant="danger" className="rounded-3 small py-2">{error}</Alert>}

              {mode === 'login' && (
                <Form onSubmit={handleLoginSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium mb-1">Email Address</Form.Label>
                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} className="form-control-sm" required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                       <Form.Label className="small fw-medium mb-0">Password</Form.Label>
                       <span className="small text-decoration-none" style={{ cursor: 'pointer', color: 'var(--brand-primary)' }} onClick={() => {setMode('forgot-request'); setError(''); setMsg('');}}>
                         Forgot?
                       </span>
                    </div>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} className="form-control-sm" required />
                  </Form.Group>

                  {/* MODIFIED: Centered and using nav-btn-responsive */}
                  <div className="text-center mt-4">
                    <Button type="submit" className="btn-primary nav-btn-responsive fw-bold shadow-sm" disabled={loading}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </div>
                </Form>
              )}

              {mode === 'forgot-request' && (
                <Form onSubmit={handleRequestResetOTP}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium mb-1">Registered Email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className="form-control-sm" required />
                  </Form.Group>

                  {/* MODIFIED: Centered and using nav-btn-responsive */}
                  <div className="text-center mt-4">
                    <Button type="submit" className="nav-btn-responsive fw-bold text-white shadow-sm" disabled={loading} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
                      {loading ? 'Sending...' : 'Send Reset OTP'}
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                     <Button variant="link" className="text-muted small p-0 text-decoration-none" onClick={() => setMode('login')}>Back to Login</Button>
                  </div>
                </Form>
              )}

              {mode === 'forgot-reset' && (
                <Form onSubmit={handleResetPassword}>
                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-medium text-muted mb-1">Email</Form.Label>
                    <Form.Control type="email" value={formData.email} disabled className="bg-light form-control-sm" />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-medium mb-1">6-Digit OTP</Form.Label>
                    <Form.Control type="text" name="otp" value={formData.otp} onChange={handleChange} maxLength="6" className="form-control-sm" required />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium mb-1">New Password</Form.Label>
                    <Form.Control type="password" name="new_password" value={formData.new_password} onChange={handleChange} className="form-control-sm" required />
                  </Form.Group>

                  {/* MODIFIED: Centered and using nav-btn-responsive */}
                  <div className="text-center mt-4">
                    <Button type="submit" className="nav-btn-responsive fw-bold text-white shadow-sm" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }}>
                      {loading ? 'Resetting...' : 'Set New Password'}
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                     <Button variant="link" className="text-muted small p-0 text-decoration-none" onClick={() => setMode('login')}>Cancel</Button>
                  </div>
                </Form>
              )}

              {mode === 'login' && (
                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    Don't have an account? <Link to="/signup" className="fw-medium text-decoration-none" style={{ color: 'var(--brand-primary)' }}>Sign up here</Link>
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