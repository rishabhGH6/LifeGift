import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, HeartHandshake, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Features.css';

const features = [
  {
    icon: <Shield className="feature-icon" size={32} color="var(--accent-blue)" />,
    title: "100% Secure & Authorized",
    description: "Govt. backed registry ensuring your data is highly protected and utilized only for authorized medical procedures."
  },
  {
    icon: <Clock className="feature-icon" size={32} color="var(--accent-red)" />,
    title: "Real-time Matching",
    description: "Advanced AI-driven algorithms connect donors with critical patients in real-time, saving precious hours."
  },
  {
    icon: <HeartHandshake className="feature-icon" size={32} color="#80f2ff" />,
    title: "End-to-End Support",
    description: "Our dedicated medical counselors provide comprehensive support to donor families throughout the process."
  }
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section className="features-section" id="about">
      <div className="container">
        <div className="features-header text-center">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Choose <span className="text-gradient-red">LifeGift</span>?
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            We operate the most advanced, transparent, and responsive donation network nationwide.
          </motion.p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card glass-panel"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="process-container glass-panel" id="process"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="process-content">
            <h3>The Donation Process</h3>
            <p>Becoming a donor is simple and takes less than 3 minutes.</p>
            <ul className="process-steps">
              <li><CheckCircle color="var(--accent-red)" size={20}/> <span>Register online with Aadhar/ID</span></li>
              <li><CheckCircle color="var(--accent-red)" size={20}/> <span>Receive digital donor card</span></li>
              <li><CheckCircle color="var(--accent-red)" size={20}/> <span>Discuss decision with family</span></li>
              <li><CheckCircle color="var(--accent-red)" size={20}/> <span>Save lives when the time comes</span></li>
            </ul>
            <button className="btn-primary" style={{marginTop: '20px'}} onClick={() => navigate('/login?type=donor')}>Start Registration</button>
          </div>
          <div className="process-image">
            {/* Using a modern CSS representation instead of an image to fit 3D aesthetic */}
            <div className="card-3d">
              <div className="card-inner">
                <div className="card-front">
                  <Shield color="var(--accent-blue)" size={48} />
                  <h4>LifeGift Donor Card</h4>
                  <div className="card-chip"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
