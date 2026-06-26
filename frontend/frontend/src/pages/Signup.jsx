import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';

function Signup() {
  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Submit Full Form
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

  // Step 1: Send OTP to Email
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
      setStep(2); // Move to full registration form
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. This email might already be registered.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Final Registration Submit
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

      // Extract detailed validation errors (like strong password rules)
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
                <h2 className="fw-bold">Create Account</h2>
                <p className="text-muted">Join Learnify to start coding</p>
              </div>

              {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
              {successMsg && <Alert variant="success" className="rounded-3">{successMsg}</Alert>}

              {/* STEP 1: ONLY SHOW EMAIL */}
              {step === 1 && (
                <Form onSubmit={handleRequestOTP}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100 py-2 fw-medium" disabled={loading}>
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </Button>
                </Form>
              )}

              {/* STEP 2: SHOW FULL FORM (Needs OTP) */}
              {step === 2 && (
                <Form onSubmit={handleFinalSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-medium">First Name</Form.Label>
                        <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-medium">Last Name</Form.Label>
                        <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium text-muted">Email (Verified)</Form.Label>
                    <Form.Control type="email" value={formData.email} disabled className="bg-light" />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">6-Digit OTP Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="otp"
                      placeholder="Enter code from email"
                      value={formData.otp}
                      onChange={handleChange}
                      maxLength="6"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-medium">Password</Form.Label>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
                    <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Min 8 chars, 1 uppercase, 1 number, 1 special character.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-medium">Confirm Password</Form.Label>
                    <Form.Control type="password" name="password2" value={formData.password2} onChange={handleChange} required />
                  </Form.Group>

                  <Button variant="success" type="submit" className="w-100 py-2 fw-medium" disabled={loading}>
                    {loading ? 'Verifying & Creating...' : 'Complete Registration'}
                  </Button>

                  <div className="text-center mt-3">
                     <Button variant="link" className="text-muted small p-0" onClick={() => {setStep(1); setSuccessMsg('');}}>
                        Use a different email
                     </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-4 pt-3 border-top">
                <p className="text-muted small mb-0">
                  Already have an account? <Link to="/login" className="fw-medium text-primary text-decoration-none">Login here</Link>
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