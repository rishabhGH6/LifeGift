import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Droplet, Globe, HeartPulse } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Impact.css';

const bloodDonationData = [
  { name: 'High-Income', donations: 31.5 },
  { name: 'Upper-Middle', donations: 16.4 },
  { name: 'Lower-Middle', donations: 6.6 },
  { name: 'Low-Income', donations: 5.0 },
];

const organTransplantData = [
  { name: 'Total Transplants', value: 173727 },
  { name: 'Waiting List (US)', value: 103000 },
];

const COLORS = ['var(--accent-red)', 'var(--accent-blue)', '#10b981', '#f59e0b'];

const Impact = () => {
  return (
    <>
      <Navbar />
      <div className="impact-container">
        <div className="impact-header">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-title"
          >
            The Global <span className="text-gradient">Impact</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hero-subtitle"
          >
            Real data from the World Health Organization (WHO) and the Global Observatory on Donation and Transplantation (GODT).
          </motion.p>
        </div>

        <div className="container impact-grid">
          {/* Blood Donation Stats */}
          <motion.div 
            className="impact-card glass-panel col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-header">
              <Droplet className="icon-red" size={32} />
              <h2>Global Blood Donations</h2>
            </div>
            <p className="stat-highlight">118.5 Million</p>
            <p className="stat-desc">Blood donations are collected globally each year. However, there is a stark disparity in collection rates based on country income levels.</p>
            
            <div className="chart-container mt-4">
              <h4 className="chart-title">Donations per 1,000 People (By Income Level)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bloodDonationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1f2e', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="donations" fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Organ Transplant Stats */}
          <motion.div 
            className="impact-card glass-panel"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-header">
              <Activity className="icon-blue" size={32} />
              <h2>Organ Transplantation</h2>
            </div>
            <p className="stat-highlight">173,727</p>
            <p className="stat-desc">Solid organ transplants were performed worldwide in the latest GODT report, a 2% increase.</p>
            
            <div className="alert-box mt-4">
              <HeartPulse size={24} className="icon-red" />
              <div>
                <h4>The Critical Shortage</h4>
                <p>Despite rising numbers, there are over <strong>103,000</strong> people on the national transplant waiting list in the U.S. alone.</p>
              </div>
            </div>

            <div className="chart-container mt-4" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={organTransplantData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {organTransplantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1f2e', border: 'none', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Voluntary Donors */}
          <motion.div 
            className="impact-card glass-panel col-span-3 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Globe className="icon-green mx-auto mb-4" size={48} />
            <h2>The Goal: 100% Voluntary Unpaid Donors</h2>
            <p className="max-w-2xl mx-auto mt-4 text-muted">
              According to the WHO, 79 countries collect over 90% of their blood supply from voluntary unpaid donors. LifeGift is committed to expanding this network, ensuring safe, reliable, and equitable access to life-saving resources across the globe.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Impact;
