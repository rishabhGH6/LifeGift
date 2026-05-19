import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type === 'donor' || type === 'recipient' || type === 'hospital') {
      setIsLogin(false);
      setFormData(prev => ({ ...prev, role: type }));
    }
  }, [location.search]);

  const { name, email, password, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, formData);
      const { token, role: userRole } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      localStorage.setItem('name', res.data.name);

      // Redirect based on role

      if (userRole === 'donor') navigate('/donor-dashboard');
      else if (userRole === 'recipient') navigate('/recipient-dashboard');
      else if (userRole === 'hospital') navigate('/hospital-dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="glow-circle red"></div>
        <div className="glow-circle blue"></div>
      </div>
      
      <motion.div 
        className="auth-card glass-panel"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <Heart className="logo-icon" fill="var(--accent-red)" color="var(--accent-red)" size={40} />
          <h2>{isLogin ? 'Welcome Back' : 'Join LifeGift'}</h2>
          <p>{isLogin ? 'Sign in to access your portal' : 'Register to make a difference'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name" 
                name="name" 
                value={name} 
                onChange={onChange} 
                required={!isLogin} 
              />
            </div>
          )}

          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              name="email" 
              value={email} 
              onChange={onChange} 
              required 
            />
          </div>

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              value={password} 
              onChange={onChange} 
              required 
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <ShieldCheck size={20} className="input-icon" />
              <select name="role" value={role} onChange={onChange} className="role-select">
                <option value="donor">Donor</option>
                <option value="recipient">Recipient</option>
                <option value="hospital">Hospital Admin</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary w-full btn-auth">
            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Register Here' : 'Login Here'}
            </span>
          </p>
          <a href="/" className="back-link">Return to Home</a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
