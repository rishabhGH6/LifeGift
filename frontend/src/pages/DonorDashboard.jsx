import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, Globe, LogOut, Heart, Activity, 
  MapPin, Calendar, Clock, TrendingUp, Bell, CheckCircle2,
  ChevronRight, Award, User, Droplets
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import Navbar from '../components/Navbar';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


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
            {greeting}, {name || 'Donor'}
            <CheckCircle2 size={20} className="text-red-500" />
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="badge-verified">
              <ShieldCheck size={14} /> Govt. Authorized
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
               Status: <span className="text-red-500 font-semibold">Active Donor</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button className="flex items-center gap-2 text-sm font-medium text-white bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
            <Globe size={16} />
            {language}
          </button>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

const IdentityCard = ({ profile }) => {
  const calculateDaysRemaining = (lastDate) => {
    if (!lastDate) return 0;
    const nextEligible = new Date(lastDate);
    nextEligible.setDate(nextEligible.getDate() + 56);
    const diff = nextEligible - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = calculateDaysRemaining(profile?.lastDonationDate);
  const isEligible = daysRemaining === 0;

  return (
    <div className="bento-item col-span-4 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-6">
        <div className={`w-4 h-4 rounded-full ${isEligible ? 'bg-green-500 animate-pulse' : 'bg-red-500'} ring-4 ring-opacity-20 ${isEligible ? 'ring-green-500' : 'ring-red-500'}`}></div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Donor Identity</h3>
            <p className="text-xs text-gray-400">ID: LG-2024-{profile?._id?.slice(-4).toUpperCase()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-4xl font-black text-white">{profile?.bloodType || 'O+'}</span>
            <span className="text-sm font-medium text-gray-400">Blood Group</span>
          </div>
          
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm font-semibold text-white mb-1">
              {isEligible ? 'Eligible to Donate Blood Today.' : `Eligible in ${daysRemaining} Days.`}
            </p>
            <p className="text-xs text-gray-400">
              {isEligible ? 'Your contribution can save up to 3 lives.' : 'Next donation cycle starts soon.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className={profile?.remindMe ? 'text-red-500' : 'text-gray-400'} />
          <span className="text-xs font-medium text-gray-400">Remind Me</span>
        </div>
        <button className={`w-10 h-6 rounded-full transition-all relative ${profile?.remindMe ? 'bg-red-500' : 'bg-white/10'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${profile?.remindMe ? 'left-5' : 'left-1'}`}></div>
        </button>
      </div>
    </div>
  );
};

const ImpactTimeline = ({ donations }) => {
  const stats = [
    { label: 'Units Donated', value: donations?.length || 0, icon: Heart },
    { label: 'Lives Impacted', value: (donations?.length || 0) * 3, icon: Award }
  ];

  return (
    <div className="bento-item col-span-4 flex flex-col h-[320px]">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 shrink-0">
        Live Impact Timeline <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4 shrink-0">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <s.icon size={20} className="text-red-500" />
            <p className="text-2xl font-black text-white mt-2">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative pl-6 border-l-2 border-white/10 space-y-6 overflow-y-auto custom-scrollbar flex-1 pb-2">
        {(donations || []).length > 0 ? donations.map((d, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20"></div>
            <p className="text-sm font-bold text-white">{d.location || 'Central Hospital'}</p>
            <p className="text-xs text-gray-400">{new Date(d.date).toLocaleDateString()}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded">SUCCESSFULLY UTILIZED</span>
          </div>
        )) : (
          <p className="text-sm text-gray-400 italic">No donations yet. Start your journey today!</p>
        )}
      </div>
    </div>
  );
};

const HealthDashboard = ({ vitals, prescriptions, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setIsUploading(true);
      try {
        const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/upload-prescription`, {
          name: file.name,
          fileData: reader.result
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        if (onUploadSuccess) onUploadSuccess(res.data.prescriptions);
      } catch (err) {
        alert('Failed to upload file.');
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleDownload = (fileData, name) => {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = name;
    link.click();
  };

  const data = vitals?.length > 0 ? vitals : [
    { name: 'Jan', hemoglobin: 14.5, bp: 120, pulse: 72 },
    { name: 'Feb', hemoglobin: 14.2, bp: 118, pulse: 75 },
    { name: 'Mar', hemoglobin: 14.8, bp: 122, pulse: 70 },
  ];

  return (
    <div className="bento-item col-span-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-white">Personal Health Vitals</h3>
          <p className="text-xs text-gray-400">Track your hemoglobin and vitals over time</p>
        </div>
        <button className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
          Download PDF Vault
        </button>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ff2d55" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
            <Tooltip 
              contentStyle={{ background: '#0a0a0b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
            <Area type="monotone" dataKey="hemoglobin" stroke="#ff2d55" strokeWidth={3} fillOpacity={1} fill="url(#colorHb)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 p-2 rounded-xl text-red-500 border border-red-500/20"><Activity size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Avg Hemoglobin</p>
            <p className="text-sm font-bold text-white">14.5 g/dL</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2 rounded-xl text-blue-400 border border-blue-500/20"><TrendingUp size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Blood Pressure</p>
            <p className="text-sm font-bold text-white">120/80 mmHg</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/10 p-2 rounded-xl text-orange-400 border border-orange-500/20"><Clock size={18} /></div>
          <div>
            <p className="text-xs text-gray-400">Pulse Rate</p>
            <p className="text-sm font-bold text-white">72 bpm</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-white">Medical Checkup Vault</h4>
          <div>
            <input type="file" id="pdf-upload" accept=".pdf" className="hidden" onChange={handleFileUpload} />
            <label htmlFor="pdf-upload" className="cursor-pointer text-[10px] font-bold text-white bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/40 transition-colors">
              {isUploading ? 'Uploading...' : '+ Upload PDF'}
            </label>
          </div>
        </div>
        <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Report Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {prescriptions && prescriptions.length > 0 ? prescriptions.map((report, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white truncate max-w-[150px]">{report.name}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDownload(report.fileData, report.name)} className="text-red-400 font-bold hover:underline">Download</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-500 text-xs italic">
                    No medical records uploaded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;

      const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/nearby-hospitals?lat=${lat}&lon=${lon}&radius=20000`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
      // Robust Fallback: Try using profile coordinates if they exist and are not [0,0]
      if (profile?.location?.coordinates && (profile.location.coordinates[0] !== 0 || profile.location.coordinates[1] !== 0)) {
        const [pLon, pLat] = profile.location.coordinates;
        try {
          const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/nearby-hospitals?lat=${pLat}&lon=${pLon}&radius=20000`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setHospitals(res.data);
          return;
        } catch (e) {
          console.error(e);
        }
      }
      
      // Secondary Fallback: Use standard metropolitan coordinates (New Delhi)
      const fallbackLat = 28.6139;
      const fallbackLon = 77.2090;
      try {
        const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/nearby-hospitals?lat=${fallbackLat}&lon=${fallbackLon}&radius=20000`, {
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
    findHospitals();
  }, []);

  const displayedHospitals = showAll ? hospitals : hospitals.slice(0, 5);

  return (
    <div className="bento-item col-span-4 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Nearby Centers</h3>
          <p className="text-[10px] text-gray-400">{hospitals.length} centers found within 20km</p>
        </div>
        <button 
          onClick={findHospitals}
          className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-colors shadow-sm"
          title="Refresh Location"
        >
          <MapPin size={20} />
        </button>
      </div>
      
      <div id="hospital-list-container" className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Clock className="animate-spin text-red-500" size={32} />
            <p className="text-xs font-bold text-gray-400">Authenticating Location...</p>
          </div>
        ) : displayedHospitals.length > 0 ? displayedHospitals.map((h, i) => (
          <div key={i} className="flex flex-col p-3 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/50 transition-all shadow-sm hover:shadow-md group">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white truncate w-48 group-hover:text-red-400 transition-colors">{h.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg border border-red-400/20">{h.distance?.toFixed(1)} km</span>
                <div className="flex items-center gap-1 text-orange-400 font-bold text-[10px]">
                  <span>{h.rating || '4.5'}</span>
                  <Heart size={8} fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 mt-1.5">
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <MapPin size={10} className="text-red-500" />
                <p className="truncate">{h.address}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <Activity size={10} className="text-red-400" />
                <p>{h.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${h.openNow !== false ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500'}`}>
                {h.openNow !== false ? 'READY FOR DONATION' : 'CLOSED NOW'}
              </span>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-red-400 hover:underline"
              >
                Get Directions
              </a>
            </div>
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="bg-white/5 p-4 rounded-full mb-4">
              <MapPin size={32} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-white">Allow location access</p>
            <p className="text-xs text-gray-400 mt-1">We need your specific location to show centers correctly.</p>
            <button onClick={findHospitals} className="mt-4 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-500/20">Retry Now</button>
          </div>
        )}
      </div>

      {hospitals.length > 5 && (
        <div className="flex items-center justify-center mt-4 pt-3 border-t border-white/5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all w-full text-center"
          >
            {showAll ? 'View Less' : 'View More Centers'}
          </button>
        </div>
      )}
    </div>
  );
};

const AppointmentBooking = ({ hospitals }) => {
  const [selectedHospital, setSelectedHospital] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState('Whole Blood Donation');
  const [bookedAppointments, setBookedAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/appointments`, {
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
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/book-appointment`, {
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
    <div id="booking-section" className="bento-item col-span-12 mt-6 border border-white/10 bg-white/5 p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white font-['Outfit']">Book Blood Donation Appointment</h3>
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
              className="w-full border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 font-medium"
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
                <Calendar size={18} className="absolute left-4 text-red-500 pointer-events-none" />
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-red-500 font-medium [color-scheme:dark]"
                  style={{ backgroundColor: '#121a28', color: '#ffffff' }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-400">Time</label>
              <div className="relative flex items-center">
                <Clock size={18} className="absolute left-4 text-red-500 pointer-events-none" />
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-white/10 text-white rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-red-500 font-medium [color-scheme:dark]"
                  style={{ backgroundColor: '#121a28', color: '#ffffff' }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Type of Donation</label>
            <select 
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full border border-white/10 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-red-500 font-medium"
              style={{ backgroundColor: '#121a28', color: '#ffffff' }}
            >
              <option value="Whole Blood Donation" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>Whole Blood Donation</option>
              <option value="Platelet Donation" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>Platelet Donation</option>
              <option value="Plasma Donation" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>Plasma Donation</option>
              <option value="General Health Screening" style={{ backgroundColor: '#121a28', color: '#ffffff' }}>General Health Screening</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20"
          >
            Confirm Appointment Booking
          </button>
        </form>

        {/* Booked Appointments List */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">Active Bookings</h4>
          <div className="border border-white/10 rounded-2xl bg-white/5 max-h-[300px] overflow-y-auto custom-scrollbar p-4 space-y-3">
            {bookedAppointments.length > 0 ? bookedAppointments.map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/30 transition-all">
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

const AIAssistant = ({ profile, onReportSaved }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hello! I'm your LifeGift AI assistant. I'm here to help you check your eligibility for your next blood donation. Shall we start with a few health questions?" }
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
      console.log('Sending message to AI Assistant...');
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/ai-chat`, {
        messages: newMessages,
        donorData: {
          bloodType: profile?.bloodType || 'Unknown',
          age: profile?.age || 0,
          weight: profile?.weight || 0
        }
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data && res.data.content) {
        setMessages([...newMessages, { role: 'model', content: res.data.content }]);
      }
    } catch (err) {
      console.error('AI Chat Error Details:', err.response || err);
      const errorMsg = err.response?.status === 404 
        ? "AI Service not found. Please ensure the backend server is running and updated."
        : "The AI Assistant is having trouble connecting. Please check your internet or API key.";
      setMessages([...newMessages, { role: 'model', content: `Error: ${errorMsg}` }]);
    } finally {
      setIsTyping(false);
    }

  };

  const generateReport = async () => {
    let fullReport = "LifeGift AI Health Screening Transcript:\n\n";
    messages.forEach(m => {
      const speaker = m.role === 'model' ? 'AI Assistant' : 'Donor';
      fullReport += `[${speaker}]: ${m.content}\n\n`;
    });

    try {
      const res = await axios.post(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/save-ai-report`, {
        title: `AI Screening - ${new Date().toLocaleDateString()}`,
        content: fullReport.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Health report generated and saved to your vault!');
      if (onReportSaved) onReportSaved(res.data.reports);
    } catch (err) {
      alert('Failed to save report.');
    }
  };

  return (
    <div className="bento-item col-span-4 flex flex-col h-[320px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-red-500/10 p-2 rounded-xl text-red-500"><Activity size={18} /></div>
        <h3 className="text-lg font-bold text-white">AI Health Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-300 border border-white/10'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[12px] text-gray-500 animate-pulse italic">Gemini is thinking...</div>}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Talk to AI..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500"
          />
          <button onClick={sendMessage} className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <button 
          onClick={generateReport}
          className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
        >
          <Award size={14} className="text-red-500" /> Save This Analysis as Report
        </button>
      </div>
    </div>
  );
};

const ReportsVault = ({ reports }) => {
  const downloadPDF = async (report) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('LifeGift AI Health Report', 20, 30);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date(report.date).toLocaleString()}`, 20, 40);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(report.title, 20, 55);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(report.content, 170);
    doc.text(splitText, 20, 65);
    
    doc.save(`LifeGift_Report_${new Date(report.date).getTime()}.pdf`);
  };

  return (
    <div className="bento-item col-span-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">AI Medical Vault</h3>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Encrypted & Secure</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {reports && reports.length > 0 ? reports.map((r, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all">
            <div>
              <p className="text-sm font-bold text-white">{r.title}</p>
              <p className="text-[10px] text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
            </div>
            <button 
              onClick={() => downloadPDF(r)}
              className="p-2 bg-white/5 rounded-xl text-gray-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all"
            >
              <Droplets size={16} />
            </button>
          </div>
        )) : (
          <div className="col-span-2 py-10 text-center text-gray-500 text-xs italic">
            No reports in vault yet. Chat with Gemini to generate your first health assessment.
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Component ---

const DonorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/donor/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(res.data);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.needsOnboarding) {
          navigate('/donor-onboarding');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return (
    <div className="dashboard-dark min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
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
              {/* Row 1: Profile + Health Graph */}
              <IdentityCard profile={profile} />
              <HealthDashboard 
                vitals={profile?.vitalsHistory} 
                prescriptions={profile?.prescriptions || []}
                onUploadSuccess={(newPrescriptions) => setProfile({...profile, prescriptions: newPrescriptions})}
              />
              
              {/* Row 2: Impact + AI Assistant + Hospital Finder */}
              <ImpactTimeline donations={profile?.donationHistory} />
              <AIAssistant 
                profile={profile} 
                onReportSaved={(newReports) => setProfile({...profile, aiReports: newReports})} 
              />
              <HospitalFinder profile={profile} hospitals={hospitals} setHospitals={setHospitals} />

              {/* Row 3: Reports Vault + Quick Actions */}
              <ReportsVault reports={profile?.aiReports} />
              
              <div className="bento-item col-span-4 bg-gradient-to-br from-red-600 to-red-900 text-white flex flex-col justify-between border-none">
                <div>
                  <h3 className="text-xl font-bold">Ready to Save Lives?</h3>
                  <p className="text-white/80 text-sm mt-2">Schedule your next donation at a certified center near you.</p>
                </div>
                <button 
                  onClick={() => {
                    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-colors mt-6"
                >
                  Book Appointment <ChevronRight size={16} />
                </button>
              </div>

              {/* Row 4: Appointment Booking */}
              <AppointmentBooking hospitals={hospitals} />
            </>
          ) : (
            <div className="col-span-12 py-20 text-center text-white">
               <Droplets size={48} className="text-red-500 animate-bounce mx-auto mb-4" />
               <p className="font-bold">Synchronizing Secure Profile...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
