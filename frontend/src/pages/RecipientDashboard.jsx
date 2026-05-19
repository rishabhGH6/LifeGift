import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldAlert, Globe, LogOut, Heart, Activity, 
  MapPin, Clock, Calendar, Bell, CheckCircle2, ChevronRight, 
  Award, User, Droplets, AlertTriangle 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Navbar';


// --- Sub-components ---

const DashboardHeader = ({ name }) => {
  const [greeting, setGreeting] = useState('');
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="flex items-center justify-between py-6 px-8 border-b border-white/5 bg-[#0a0a0b]">
      <div className="flex items-center gap-4">
        <div className="bg-white/5 p-2 rounded-full border border-white/10">
          <User size={24} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {greeting}, {name || 'Recipient'}
            <CheckCircle2 size={20} className="text-blue-500" />
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="badge-verified bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
              <ShieldAlert size={14} /> Identity Verified
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
               Status: <span className="text-blue-500 font-semibold">Active Recipient</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

const IdentityCard = ({ profile }) => {
  return (
    <div className="bento-item col-span-4 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-6">
        <div className={`w-4 h-4 rounded-full ${profile?.urgencyLevel === 'Emergency' ? 'bg-red-500 animate-pulse ring-red-500' : 'bg-blue-500 ring-blue-500'} ring-4 ring-opacity-20`}></div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 border border-blue-500/20">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recipient Identity</h3>
            <p className="text-xs text-gray-400">ID: REQ-2024-{profile?._id?.slice(-4).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-white">{profile?.bloodType || 'O+'}</span>
            <span className="text-sm font-medium text-gray-400">Required Blood Group</span>
          </div>
          
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm font-semibold text-white mb-1">
              Condition: {profile?.medicalCondition || 'Not specified'}
            </p>
            <p className="text-xs text-gray-400">
              Urgency: <strong className={profile?.urgencyLevel === 'Emergency' ? 'text-red-500' : 'text-blue-400'}>{profile?.urgencyLevel}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <MapPin size={16} />
          <span className="text-xs font-medium truncate max-w-[200px]">{profile?.address || 'Location registered'}</span>
        </div>
      </div>
    </div>
  );
};

const SosPanel = ({ profile }) => {
  const [sosStatus, setSosStatus] = useState('idle');

  const triggerSOS = async () => {
    if (!window.confirm('Are you sure you want to trigger an Emergency Blood Request? This will alert nearby donors and hospitals.')) return;
    setSosStatus('loading');
    try {
      await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/sos`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSosStatus('active');
    } catch (err) {
      alert('Failed to trigger SOS.');
      setSosStatus('idle');
    }
  };

  return (
    <div className="bento-item col-span-8 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a0a0b] to-[#150505]">
      {sosStatus === 'active' && (
        <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"></div>
      )}
      <div className="text-center z-10 p-6">
        <button 
          onClick={triggerSOS}
          disabled={sosStatus === 'loading' || sosStatus === 'active'}
          className={`relative group w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center gap-2 mx-auto transition-all shadow-2xl ${
            sosStatus === 'active' 
              ? 'bg-red-600 border-red-500 shadow-red-600/50 scale-95' 
              : 'bg-red-500/10 border-red-500/50 hover:bg-red-500/30 hover:border-red-500 hover:scale-105 shadow-red-500/20'
          }`}
        >
          {sosStatus === 'loading' ? (
            <Clock size={48} className="text-red-500 animate-spin" />
          ) : (
            <AlertTriangle size={64} className={sosStatus === 'active' ? 'text-white' : 'text-red-500 group-hover:scale-110 transition-transform'} />
          )}
          <span className={`font-black text-2xl tracking-widest ${sosStatus === 'active' ? 'text-white' : 'text-red-500'}`}>
            {sosStatus === 'active' ? 'SOS ACTIVE' : 'SOS'}
          </span>
          {sosStatus === 'active' && (
             <div className="absolute -inset-4 rounded-full border-4 border-red-500/50 animate-ping"></div>
          )}
        </button>
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-2">Emergency Blood Request</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            {sosStatus === 'active' 
              ? "Your request has been broadcasted to the hospital admin and all nearby donors. Help is on the way!" 
              : "Press this button ONLY in case of an absolute emergency to immediately broadcast a request for your blood type to nearby donors and hospital administration."}
          </p>
        </div>
      </div>
    </div>
  );
};

const HospitalFinder = ({ profile, hospitals, setHospitals }) => {
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const findHospitals = async () => {
    setLoading(true);
    setShowAll(false);
    try {
      let lat, lon;

      // 1. Primary Source: Saved profile coordinates from onboarding
      if (profile?.location?.coordinates && 
          profile.location.coordinates[0] !== 0 && 
          profile.location.coordinates[1] !== 0) {
        lon = profile.location.coordinates[0];
        lat = profile.location.coordinates[1];
        console.log("Using primary onboarded profile coordinates:", lat, lon);
      } else {
        // 2. Secondary Source: Live Browser Geolocation (fallback)
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 5000, maximumAge: 0
          });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        console.log("Using browser geolocation coordinates:", lat, lon);
      }

      const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/nearby-hospitals?lat=${lat}&lon=${lon}&radius=20000`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHospitals(res.data);
    } catch (err) {
      console.error("Coordinate sourcing failed, attempting default fallback:", err);

      // 3. Absolute Fallback: New Delhi metropolitan default
      const fallbackLat = 28.6139;
      const fallbackLon = 77.2090;
      try {
        const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/nearby-hospitals?lat=${fallbackLat}&lon=${fallbackLon}&radius=20000`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHospitals(res.data);
      } catch (fallbackErr) {
        console.error("All hospital finder attempts failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) findHospitals();
  }, [profile]);

  const displayedHospitals = showAll ? hospitals : hospitals.slice(0, 5);

  return (
    <div className="bento-item col-span-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Nearby Blood Banks & Hospitals</h3>
          <p className="text-[10px] text-gray-400">{hospitals.length} centers found</p>
        </div>
        <button onClick={findHospitals} className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 hover:bg-blue-500/20">
          <MapPin size={20} />
        </button>
      </div>
      
      <div id="hospital-list-container" className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Clock className="animate-spin text-blue-500" size={32} />
            <p className="text-xs font-bold text-gray-400">Locating Facilities...</p>
          </div>
        ) : displayedHospitals.length > 0 ? displayedHospitals.map((h, i) => (
          <div key={i} className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/50 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white truncate w-48">{h.name}</p>
              <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-lg border border-blue-400/20">{h.distance?.toFixed(1)} km</span>
            </div>
            <div className="flex flex-col gap-1 mt-1.5">
              <div className="flex items-center gap-2 text-[10px] text-gray-400"><MapPin size={10} className="text-blue-500" /><p className="truncate">{h.address}</p></div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium"><Activity size={10} className="text-blue-400" /><p>{h.phone}</p></div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-400 hover:underline">Get Directions</a>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 text-xs text-gray-500">No centers found.</div>
        )}
      </div>

      {hospitals.length > 5 && (
        <div className="flex items-center justify-center mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all w-full text-center"
          >
            {showAll ? 'View Less' : 'View More Centers'}
          </button>
        </div>
      )}
    </div>
  );
};

const AIAssistant = ({ profile, onReportSaved }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm your LifeGift AI assistant for Recipient Support. How can I help you today with your medical condition or upcoming transfusion?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/ai-chat`, {
        messages: newMessages,
        recipientData: {
          bloodType: profile?.bloodType,
          medicalCondition: profile?.medicalCondition
        }
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

      if (res.data?.content) {
        setMessages([...newMessages, { role: 'model', content: res.data.content }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'model', content: `Error: Could not connect to AI service.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bento-item col-span-8 flex flex-col h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500"><Activity size={18} /></div>
        <h3 className="text-lg font-bold text-white">AI Support Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 border border-white/10'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[12px] text-gray-500 animate-pulse italic">Gemini is thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about preparations, diets, procedures..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        />
        <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const BloodAvailabilityChecker = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkAvailability = async (e) => {
    e.preventDefault();
    if (!bloodGroup) {
      setStatusMessage("Please select a blood group.");
      setIsAvailable(false);
      return;
    }
    setChecking(true);
    setStatusMessage(null);
    try {
      const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/check-blood/${encodeURIComponent(bloodGroup)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setIsAvailable(res.data.available);
      if (res.data.available) {
        setStatusMessage("Yes, this blood group is available in our stock.");
      } else {
        setStatusMessage("Sorry, this blood group is currently not available.");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Error checking availability. Please try again.");
      setIsAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="bento-item col-span-4 mt-6 border border-white/10 bg-white/5 p-8 rounded-3xl flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
            <Droplets size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Check Blood Stock</h3>
            <p className="text-xs text-gray-400">Find real-time availability</p>
          </div>
        </div>

        <form onSubmit={checkAvailability} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Select Blood Group</label>
            <select 
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 font-medium"
              style={{ backgroundColor: '#121a28', color: '#ffffff' }}
            >
              <option value="" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>-- Choose --</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg} style={{ backgroundColor: '#121a28', color: '#ffffff' }}>{bg}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={checking}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Check Availability'}
          </button>
        </form>
      </div>

      {statusMessage && (
        <div className={`mt-6 p-4 rounded-2xl border flex items-center gap-3 ${isAvailable ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
          {isAvailable ? <CheckCircle2 size={24} className="shrink-0" /> : <AlertTriangle size={24} className="shrink-0" />}
          <p className="text-sm font-semibold">{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

const AppointmentBooking = ({ hospitals }) => {
  const [selectedHospital, setSelectedHospital] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('Transfusion Prep');
  const [bookedAppointments, setBookedAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/appointments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setBookedAppointments(res.data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    fetchAppointments();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedHospital || !date || !time) {
      alert('Please fill in all the booking details.');
      return;
    }
    try {
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/book-appointment`, {
        hospitalName: selectedHospital,
        date,
        time,
        purpose
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setBookedAppointments([res.data.appointment, ...bookedAppointments]);
      alert(`Appointment successfully booked at ${selectedHospital}!`);
      setSelectedHospital('');
      setDate('');
      setTime('');
    } catch (err) {
      console.error(err);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className="bento-item col-span-8 mt-6 border border-white/10 bg-white/5 p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 border border-blue-500/20">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Book Blood Transfusion / Hospital Appointment</h3>
          <p className="text-xs text-gray-400">Schedule your visit easily at any verified nearby facility</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Form */}
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Select Facility</label>
            <select 
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 font-medium"
              style={{ backgroundColor: '#121a28', color: '#ffffff' }}
            >
              <option value="" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>-- Choose Nearby Center --</option>
              {hospitals.map((h, i) => (
                <option key={i} value={h.name} style={{ backgroundColor: '#121a28', color: '#ffffff' }}>{h.name} ({h.distance?.toFixed(1)} km away)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-400">Date</label>
              <div className="relative flex items-center">
                <Calendar size={18} className="absolute left-4 text-blue-500 pointer-events-none" />
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 font-medium [color-scheme:dark]"
                  style={{ backgroundColor: '#121a28', color: '#ffffff' }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-400">Time</label>
              <div className="relative flex items-center">
                <Clock size={18} className="absolute left-4 text-blue-500 pointer-events-none" />
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-blue-500 font-medium [color-scheme:dark]"
                  style={{ backgroundColor: '#121a28', color: '#ffffff' }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Purpose of Visit</label>
            <select 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 font-medium"
              style={{ backgroundColor: '#121a28', color: '#ffffff' }}
            >
              <option value="Transfusion Prep" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>Transfusion Preparation</option>
              <option value="Blood Crossmatching" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>Blood Crossmatching</option>
              <option value="General Health Screening" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>General Health Screening</option>
              <option value="Consultation" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>Medical Consultation</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
          >
            Confirm Appointment Booking
          </button>
        </form>

        {/* Booked Appointments List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">Active Bookings</h4>
          <div className="border border-white/10 rounded-2xl bg-white/5 max-h-[300px] overflow-y-auto custom-scrollbar p-4 space-y-3">
            {bookedAppointments.length > 0 ? bookedAppointments.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                <div>
                  <p className="text-sm font-bold text-white">{app.hospitalName}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={10} /> {app.date} @ {app.time}</span>
                    <span>•</span>
                    <span>{app.purpose}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 uppercase">
                    {app.status}
                  </span>
                  <p className="text-[9px] text-gray-500 mt-1">ID: {app.id}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-xs text-gray-500 italic">
                No upcoming appointments. Book your appointment today!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---

const RecipientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/recipient/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.needsOnboarding) {
          navigate('/recipient-onboarding');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return (
    <div className="dashboard-dark min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="dashboard-dark min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />
      <div className="pt-20">
        <DashboardHeader name={localStorage.getItem('name')} />
        
        <main className="bento-grid">
          {profile ? (
            <>
              {/* Row 1: Profile + SOS Button */}
              <IdentityCard profile={profile} />
              <SosPanel profile={profile} />
              
              {/* Row 2: Hospital Finder + AI Assistant */}
              <HospitalFinder profile={profile} hospitals={hospitals} setHospitals={setHospitals} />
              <AIAssistant profile={profile} />

              {/* Row 3: Blood Availability Checker & Appointment Booking */}
              <BloodAvailabilityChecker />
              <AppointmentBooking hospitals={hospitals} />
            </>
          ) : (
            <div className="col-span-12 py-20 text-center text-white">
               <Activity size={48} className="text-blue-500 animate-bounce mx-auto mb-4" />
               <p className="font-bold">Synchronizing Secure Profile...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecipientDashboard;
