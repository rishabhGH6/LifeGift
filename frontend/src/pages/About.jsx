import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Droplet, Activity, Users, Globe2, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './About.css';

const About = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <div className="about-hero">
          <div className="about-background">
            <div className="glow-circle red glow-top-left"></div>
            <div className="glow-circle blue glow-bottom-right"></div>
          </div>
          
          <motion.div 
            className="about-header"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Life is a <span className="text-gradient">Gift.</span> <br/> Pass it On.
            </h1>
            <p className="hero-subtitle">
              We are a government-authorized platform committed to bridging the gap between life-saving heroes and those in desperate need. Every drop, every breath, every heartbeat is a legacy waiting to be shared.
            </p>
          </motion.div>
        </div>

        <div className="container stats-section">
          <motion.div 
            className="stat-card glass-panel"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Droplet size={48} className="stat-icon red" />
            <h3>Blood Donation</h3>
            <p>1 donation can save up to 3 lives. Be the lifeline someone is waiting for.</p>
          </motion.div>
          <motion.div 
            className="stat-card glass-panel"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Activity size={48} className="stat-icon blue" />
            <h3>Organ Donation</h3>
            <p>A single organ donor can save up to 8 lives and improve the quality of life for 75 more.</p>
          </motion.div>
          <motion.div 
            className="stat-card glass-panel"
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ShieldCheck size={48} className="stat-icon green" />
            <h3>Verified Hospitals</h3>
            <p>Partnered with top-tier, certified healthcare institutions to ensure safety and transparency.</p>
          </motion.div>
        </div>

        <div className="container vision-section">
          <motion.div 
            className="vision-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2>Our <span className="text-gradient">Vision</span></h2>
            <p>
              We envision a world where no life is lost due to a shortage of blood or organs. By leveraging technology, we create a seamless, transparent, and rapid connection between willing donors and patients. 
            </p>
            <p>
              LifeGift is more than just a platform; it's a movement of compassion. We empower individuals to become everyday heroes, transforming moments of despair into miracles of hope.
            </p>
            <ul className="vision-list">
              <li><Heart size={20} /> <span>100% Volunteer Driven</span></li>
              <li><Users size={20} /> <span>Community Focused</span></li>
              <li><Globe2 size={20} /> <span>Nationwide Reach</span></li>
            </ul>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About;
