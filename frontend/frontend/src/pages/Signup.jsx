import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
    otp: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email) {
      setError('Please enter your email to receive an OTP.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/send-register-otp/', { email: formData.email });
      setSuccessMsg('An OTP has been sent to your email. Please check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. This email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/register/', formData);
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    } catch (err) {
      console.error(err);
      if (err.response?.data) {
        const errData = err.response.data;
        if (errData.password) setError(errData.password[0]);
        else if (errData.otp) setError(errData.otp[0]);
        else if (errData.email) setError(errData.email[0]);
        else setError('Registration failed. Please check your inputs.');
      } else {
        setError('A network error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold fs-3 fs-md-2">Create Account</h2>
                <p className="text-muted small mb-0">Join Learnify to start coding</p>
              </div>

              {error && <Alert variant="danger" className="rounded-3 small py-2">{error}</Alert>}
              {successMsg && <Alert variant="success" className="rounded-3 small py-2">{successMsg}</Alert>}

              {step === 1 && (
                <Form onSubmit={handleRequestOTP}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control-sm"
                      required
                    />
                  </Form.Group>

                  {/* MODIFIED: Centered and using nav-btn-responsive to match topic buttons */}
                  <div className="text-center mt-4">
                    <Button type="submit" className="btn-primary nav-btn-responsive fw-bold shadow-sm" disabled={loading}>
                      {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    </Button>
                  </div>
                </Form>
              )}

              {step === 2 && (
                <Form onSubmit={handleFinalSubmit}>
                  <Row className="g-2">
                    <Col xs={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-medium mb-1">First Name</Form.Label>
                        <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="form-control-sm" required />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-medium mb-1">Last Name</Form.Label>
                        <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="form-control-sm" required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-medium text-muted mb-1">Email (Verified)</Form.Label>
                    <Form.Control type="email" value={formData.email} disabled className="bg-light form-control-sm" />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-medium mb-1">6-Digit OTP Code</Form.Label>
                    <Form.Control type="text" name="otp" placeholder="Enter code" value={formData.otp} onChange={handleChange} maxLength="6" className="form-control-sm" required />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label className="small fw-medium mb-1">Password</Form.Label>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} className="form-control-sm" required />
                    <Form.Text className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Min 8 chars, 1 uppercase, 1 number, 1 special.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium mb-1">Confirm Password</Form.Label>
                    <Form.Control type="password" name="password2" value={formData.password2} onChange={handleChange} className="form-control-sm" required />
                  </Form.Group>

                  {/* MODIFIED: Centered and using nav-btn-responsive */}
                  <div className="text-center mt-4">
                    <Button type="submit" className="nav-btn-responsive fw-bold text-white shadow-sm" disabled={loading} style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', border: 'none' }}>
                      {loading ? 'Verifying & Creating...' : 'Complete Registration'}
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                     <Button variant="link" className="text-muted small p-0 text-decoration-none" onClick={() => {setStep(1); setSuccessMsg('');}}>
                        Use a different email
                     </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted small mb-0">
                  Already have an account? <Link to="/login" className="fw-medium text-decoration-none" style={{ color: 'var(--brand-primary)' }}>Login here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Signup;