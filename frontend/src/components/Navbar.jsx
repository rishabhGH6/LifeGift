import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Menu, X, ShieldCheck } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled glass-panel' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container nav-container">
        <Link to="/" className="logo">
          <Heart className="logo-icon" fill="var(--accent-red)" color="var(--accent-red)" size={32} />
          <div className="logo-text">
            <span className="brand-name">LifeGift</span>
            <span className="govt-badge"><ShieldCheck size={14} /> Govt. Authorized</span>
          </div>
        </Link>

        <div className="desktop-menu">
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/#process" className="nav-link">How it Works</Link>
          <Link to="/impact" className="nav-link">Impact</Link>
          <button className="btn-secondary" onClick={() => window.location.href = '/login'}>Login</button>
          <button className="btn-primary" onClick={() => window.location.href = '/login'}>Register</button>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          className="mobile-menu glass-panel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link to="/#process" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How it Works</Link>
          <Link to="/impact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Impact</Link>
          <div className="mobile-actions">
            <button className="btn-secondary w-full" onClick={() => window.location.href = '/login'}>Login</button>
            <button className="btn-primary w-full" onClick={() => window.location.href = '/login'}>Register</button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
