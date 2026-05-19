import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <FAQ />
      <Footer />
    </>
  );
};

export default LandingPage;
