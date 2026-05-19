import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Users, Droplet } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import './Hero.css';

const AnimatedSphere = () => {
  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} scale={2.5}>
        <MeshDistortMaterial
          color="#ff3366"
          attach="material"
          distort={0.4}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

const BlueSphere = () => {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={3}>
      <Sphere args={[1, 64, 64]} scale={1.5} position={[-4, -2, -2]}>
        <MeshDistortMaterial
          color="#00e5ff"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
    </Float>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero" id="home">
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00e5ff" />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <AnimatedSphere />
          <BlueSphere />
        </Canvas>
      </div>

      <div className="container hero-content">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="badge glass-panel">
            <span className="live-dot"></span>
            National Registry Live
          </div>
          <h1 className="hero-title">
            Give the Gift of <br />
            <span className="text-gradient-red">Life</span> & <span className="text-gradient-blue">Hope</span>
          </h1>
          <p className="hero-description">
            Join the government authorized national registry for blood and organ donation.
            One decision can save up to 8 lives and enhance 75 more. Your legacy starts here.
          </p>

          <div className="hero-actions">
            <button className="btn-primary btn-large" onClick={() => navigate('/login?type=donor')}>
              Become a Donor <ArrowRight size={20} />
            </button>
            <button className="btn-secondary btn-large" onClick={() => navigate('/login?type=recipient')}>
              Request Resources
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item glass-panel">
              <Users className="stat-icon text-gradient-blue" />
              <div>
                <h4>10+</h4>
                <p>Registered Donors</p>
              </div>
            </div>
            <div className="stat-item glass-panel">
              <Activity className="stat-icon text-gradient-red" />
              <div>
                <h4>15+</h4>
                <p>Lives Saved Yearly</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
