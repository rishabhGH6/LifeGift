import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, User, Calendar, Droplets, Scale, 
  MapPin, ClipboardList, ArrowRight, CheckCircle2 
} from 'lucide-react';
import Navbar from '../components/Navbar';

const DonorOnboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem('name') || '',
    age: '',
    gender: 'Male',
    bloodType: 'O+',
    weight: '',
    medicalHistory: 'None',
    address: '',
    location: { coordinates: [0, 0] }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({
          ...formData,
          location: { coordinates: [pos.coords.longitude, pos.coords.latitude] }
        });
        alert('Location captured successfully!');
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        alert("Unable to access live location. Using default location coordinates [New Delhi].");
        setFormData({
          ...formData,
          location: { coordinates: [77.2090, 28.6139] }
        });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!formData.age || !formData.weight) {
      alert('Please fill in your age and weight.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight)
      };

      await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/profile`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/donor-dashboard');
    } catch (err) {
      console.error('Onboarding Error:', err.response?.data || err);
      const msg = err.response?.data?.message || 'Failed to save profile. Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Medical Details', icon: Droplets },
    { title: 'Location', icon: MapPin }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center font-['Plus_Jakarta_Sans']">
      <Navbar />
      
      <div className="max-w-xl w-full mx-4">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step >= i + 1 ? 'bg-red-500 text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                <s.icon size={18} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= i + 1 ? 'text-red-500' : 'text-gray-400'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <motion.div 
          layout
          className="bg-white rounded-[32px] p-10 shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Let's set up your profile</h2>
                  <p className="text-gray-400 mt-2">First, tell us a bit about yourself.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Full Name</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium"
                      placeholder="e.g. Aranya Chak"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-600">Age</label>
                      <input 
                        type="number" 
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium"
                        placeholder="e.g. 24"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-600">Gender</label>
                      <select 
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-red-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-black text-gray-900">Medical Details</h2>
                  <p className="text-gray-400 mt-2">This helps us verify your eligibility.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-600">Blood Type</label>
                      <select 
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium appearance-none"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-600">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium"
                        placeholder="e.g. 70"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Medical History</label>
                    <textarea 
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium"
                      placeholder="Any conditions or allergies?"
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-[2] bg-red-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-500/30"
                  >
                    Almost there <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-3xl font-black text-gray-900">One last thing</h2>
                  <p className="text-gray-400 mt-2">Tell us where you are so we can find nearby centers.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-600">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 transition-all font-medium"
                      placeholder="e.g. 123 Street, City"
                    />
                  </div>

                  <button 
                    onClick={getLocation}
                    className="w-full py-4 px-6 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50/30 transition-all font-bold"
                  >
                    <MapPin size={20} /> Access Live Location
                  </button>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-100 text-gray-600 font-bold py-5 rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] bg-green-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Finish Setup'} <CheckCircle2 size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorOnboarding;
