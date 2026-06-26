import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';

function Footer() {
  const [settings, setSettings] = useState({
    brand_name: '{} Learnify',
    footer_description: 'Empowering developers worldwide with project-based learning.',
    github_link: '',
    twitter_link: '',
    linkedin_link: '',
    contact_email: 'support@learnify.com',
    copyright_text: '© 2026 Learnify. All rights reserved.'
  });

  const [footerCategories, setFooterCategories] = useState([]);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Fetch Brand Settings
        const settingsRes = await axios.get('/api/site-settings/');
        if (settingsRes.data && Object.keys(settingsRes.data).length > 0) {
          setSettings(settingsRes.data);
        }

        // Fetch Dynamic Columns & Links
        const categoriesRes = await axios.get('/api/footer-data/');
        setFooterCategories(categoriesRes.data);
      } catch (error) {
        console.error('Failed to load footer data from Django', error);
      }
    };
    fetchFooterData();
  }, []);

  return (
    <footer style={{ backgroundColor: '#0f172a', paddingTop: '4rem', paddingBottom: '2rem', marginTop: 'auto' }}>
      <Container>
        <Row className="gy-4 mb-5">
          {/* Static Brand Section */}
          <Col lg={4} md={6}>
            <h4 className="fw-bold text-white mb-3">{settings.brand_name}</h4>
            <p className="pe-lg-4" style={{ color: '#94a3b8', lineHeight: '1.6' }}>
              {settings.footer_description}
            </p>

            {/* FIX: Explicitly showing the email address on the UI */}
            {settings.contact_email && (
               <div className="mt-3 mb-4">
                 <a href={`mailto:${settings.contact_email}`} className="footer-link d-flex align-items-center gap-2">
                   <i className="bi bi-envelope-fill text-primary"></i>
                   <span>{settings.contact_email}</span>
                 </a>
               </div>
            )}

            <div className="d-flex gap-3 mt-2">
              {settings.twitter_link && <a href={settings.twitter_link} target="_blank" rel="noreferrer" className="footer-icon"><i className="bi bi-twitter"></i></a>}
              {settings.github_link && <a href={settings.github_link} target="_blank" rel="noreferrer" className="footer-icon"><i className="bi bi-github"></i></a>}
              {settings.linkedin_link && <a href={settings.linkedin_link} target="_blank" rel="noreferrer" className="footer-icon"><i className="bi bi-linkedin"></i></a>}
            </div>
          </Col>

          {/* DYNAMIC COLUMNS FROM DJANGO ADMIN */}
          {footerCategories.length > 0 ? (
            footerCategories.map((category) => (
              <Col lg={2} md={6} key={category.id}>
                <h5 className="fw-bold text-white mb-3">{category.title}</h5>
                <ul className="list-unstyled d-flex flex-column gap-2">
                  {category.links.map((link) => (
                    <li key={link.id}>
                      {link.url ? (
                        /* If URL starts with HTTP, it's external. Otherwise it's an internal React route */
                        link.url.startsWith('http') ? (
                          <a href={link.url} target="_blank" rel="noreferrer" className="footer-link">
                            {link.title}
                          </a>
                        ) : (
                          <Link to={link.url} className="footer-link">
                            {link.title}
                          </Link>
                        )
                      ) : (
                        /* If no URL is provided, just show the text */
                        <span style={{ color: '#94a3b8' }}>{link.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Col>
            ))
          ) : (
             <Col lg={8} className="d-flex align-items-center justify-content-center">
                 <span className="text-muted small">Configure footer links in Django Admin</span>
             </Col>
          )}
        </Row>

        {/* Copyright Section */}
        <Row className="border-top pt-4" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
          <Col className="text-center small" style={{ color: '#64748b' }}>
            {settings.copyright_text}
          </Col>
        </Row>
      </Container>

      <style>{`
        .footer-link { color: #cbd5e1; text-decoration: none; transition: color 0.2s ease; }
        .footer-link:hover { color: #ffffff; }
        .footer-icon { color: #cbd5e1; font-size: 1.25rem; transition: color 0.2s ease; }
        .footer-icon:hover { color: #ffffff; }
      `}</style>
    </footer>
  );
}

export default Footer;