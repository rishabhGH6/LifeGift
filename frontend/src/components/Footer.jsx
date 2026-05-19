import React, { useState, useEffect } from 'react';
import { Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import axios from 'axios';
import './Footer.css';

const Footer = () => {
  const [apiStatus, setApiStatus] = useState('Connecting...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/status`);
        if (response.data.status === 'success') {
          setApiStatus('System Online - Backend Connected');
        }
      } catch (error) {
        setApiStatus('System Offline - Backend Error');
      }
    };
    checkBackend();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="logo">
              <Heart className="logo-icon" fill="var(--accent-red)" color="var(--accent-red)" size={32} />
              <div className="logo-text">
                <span className="brand-name">LifeGift</span>
                <span className="govt-badge">National Registry</span>
              </div>
            </div>
            <p className="footer-desc">
              The official government portal for blood and organ donation. Ensuring transparency, security, and timely matching.
            </p>
            <div className={`system-status ${apiStatus.includes('Online') ? 'online' : 'offline'}`}>
              <div className="status-dot"></div>
              <span>{apiStatus}</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/#process">How it Works</a></li>
              <li><a href="/impact">Our Impact</a></li>
              <li><a href="/#faq">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Donor Rights</a></li>
              <li><a href="#">Govt. Mandates</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul className="contact-info">
              <li><Phone size={18} /> <span>1800-11-4770 (Toll Free)</span></li>
              <li><Mail size={18} /> <span>support@lifegift.gov.in</span></li>
              <li><MapPin size={18} /> <span>National Health Authority,<br/>New Delhi 110001</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} LifeGift. All rights reserved. A Govt. of India Initiative.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
