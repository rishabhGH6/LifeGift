import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building, Droplets, AlertTriangle, Activity, 
  ShieldCheck, CheckCircle2, MapPin, LogOut, 
  Clock, Plus, Minus, X, Send, RefreshCw, 
  User, PlusCircle, Heart, Info, AlertCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';

// Helper to format timestamps relative to now
const formatRelativeTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sosRequests, setSosRequests] = useState([]);
  const [resolvingId, setResolvingId] = useState(null);
  
  // States for interactive panels
  const [alertForm, setAlertForm] = useState({ severity: 'info', message: '' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editValue, setEditValue] = useState(0);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`\https://lifegift.onrender.com/api/hospital/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSosRequests = async () => {
    try {
      const res = await axios.get(`\https://lifegift.onrender.com/api/hospital/sos-requests`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSosRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch SOS requests:", err);
    }
  };

  const handleResolveSos = async (id) => {
    setResolvingId(id);
    try {
      await axios.put(`\https://lifegift.onrender.com/api/hospital/sos-requests/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Optimistically remove from list immediately
      setSosRequests(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to resolve SOS request:', err);
    } finally {
      setResolvingId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'hospital') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
    fetchSosRequests();

    // Auto-poll SOS requests every 20 seconds for real-time updates
    const sosInterval = setInterval(fetchSosRequests, 20000);
    return () => clearInterval(sosInterval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Adjust units by +/- 1
  const handleInventoryChange = async (bloodGroup, change) => {
    if (!data) return;
    const currentUnits = data.blood_inventory[bloodGroup].units;
    const newUnits = Math.max(0, currentUnits + change);
    
    try {
      const res = await axios.put(`\https://lifegift.onrender.com/api/hospital/inventory`, {
        bloodInventory: { [bloodGroup]: newUnits }
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      alert('Failed to update inventory');
    }
  };

  // Start inline edit mode
  const startEditing = (bloodGroup, currentUnits) => {
    setEditingGroup(bloodGroup);
    setEditValue(currentUnits);
  };

  // Save manual input edit
  const saveEditing = async (bloodGroup) => {
    try {
      const res = await axios.put(`\https://lifegift.onrender.com/api/hospital/inventory`, {
        bloodInventory: { [bloodGroup]: Number(editValue) }
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
      setEditingGroup(null);
    } catch (err) {
      alert('Failed to update inventory');
    }
  };

  // Restock all low/critical supplies to a safe default of 15 units
  const handleRestockAll = async () => {
    if (!data) return;
    if (!window.confirm('Do you want to restock all low and critical blood categories to the standard level of 15 units?')) return;
    
    const restockData = {};
    Object.keys(data.blood_inventory).forEach(bg => {
      const units = data.blood_inventory[bg].units;
      if (units <= 10) {
        restockData[bg] = 15;
      }
    });

    if (Object.keys(restockData).length === 0) {
      alert('All blood inventory levels are currently safe.');
      return;
    }

    try {
      const res = await axios.put(`\https://lifegift.onrender.com/api/hospital/inventory`, {
        bloodInventory: restockData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
      alert('Emergency restock completed successfully!');
    } catch (err) {
      alert('Restock failed');
    }
  };

  // Manage donation intents (Approve / Reject)
  const handleIntentStatusChange = async (intentId, newStatus) => {
    try {
      const res = await axios.put(`\https://lifegift.onrender.com/api/hospital/intent/${intentId}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Add custom alert
  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!alertForm.message.trim()) return;

    try {
      const res = await axios.post(`\https://lifegift.onrender.com/api/hospital/alert`, alertForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
      setAlertForm({ severity: 'info', message: '' });
    } catch (err) {
      alert('Failed to add alert');
    }
  };

  // Delete/dismiss alert
  const handleDeleteAlert = async (alertId) => {
    try {
      const res = await axios.delete(`\https://lifegift.onrender.com/api/hospital/alert/${alertId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      alert('Failed to dismiss alert');
    }
  };

  if (loading) return (
    <div className="dashboard-dark min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !data) return (
    <div className="dashboard-dark min-h-screen flex flex-col items-center justify-center gap-4">
      <AlertTriangle size={48} className="text-red-500" />
      <h2 className="text-xl font-bold text-white">{error || 'Unable to load dashboard'}</h2>
      <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      <button onClick={handleLogout} className="btn-secondary">Back to Login</button>
    </div>
  );

  const { hospital, blood_inventory, inventory_summary, donation_intent_queue, alerts } = data;

  // Filter intents
  const filteredIntents = donation_intent_queue.intents.filter(intent => {
    if (filterStatus === 'all') return true;
    return intent.status === filterStatus;
  });

  return (
    <div className="dashboard-dark min-h-screen font-['Plus_Jakarta_Sans']">
      <Navbar />
      
      <div className="pt-20">
        {/* Header Section */}
        <div className="flex items-center justify-between py-6 px-8 border-b border-white/5 bg-[#0a0a0b]">
          <div className="flex items-center gap-4">
            <div className="bg-white/5 p-3 rounded-full border border-white/10 text-red-500 shadow-md">
              <Building size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                {greeting}, {hospital.name}
                <CheckCircle2 size={20} className="text-green-500" />
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="badge-verified bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> Registered Facility
                </span>
                <span className="text-xs text-gray-400">
                  ID: <span className="text-red-400 font-semibold">{hospital.registration_id}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={handleLogout}
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <main className="container py-8">
          <div className="bento-grid">
            
            {/* Bento-Item 1: Hospital profile Card (Col-span-4) */}
            <div className="bento-item col-span-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Building size={120} className="text-white" />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Facility Details</h3>
                    <p className="text-xs text-gray-400">Government Portal Status</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address & Location</span>
                    <p className="text-sm font-semibold text-white mt-1 flex items-start gap-2">
                      <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                      {hospital.location}
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Overview</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-white font-medium">Verified Facility:</span>
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-white font-medium">Inventory Capacity:</span>
                      <span className="text-xs text-gray-300 font-semibold">Unrestricted</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400">Last synchronized</span>
                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin" /> Live Sync Active
                </span>
              </div>
            </div>

            {/* Bento-Item 2: Real-time Alerts Panel (Col-span-8) */}
            <div className="bento-item col-span-8 flex flex-col h-[450px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-red-500/10 p-2.5 rounded-xl text-red-500 border border-red-500/20"><AlertTriangle size={20} /></div>
                  <h3 className="text-xl font-bold text-white font-['Outfit']">Facility Wide Notifications & Alerts</h3>
                </div>
                <span className="text-xs font-black bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-300">
                  {alerts.length} active
                </span>
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar mb-4">
                {alerts.length > 0 ? alerts.map((alert) => {
                  let alertClass = 'border-white/10 bg-white/5';
                  let icon = <Info size={22} className="text-blue-400 shrink-0" />;
                  
                  if (alert.severity === 'critical') {
                    alertClass = 'border-red-500/40 bg-red-500/10 shadow-lg shadow-red-500/10 animate-pulse text-red-300';
                    icon = <AlertCircle size={22} className="text-red-500 shrink-0" />;
                  } else if (alert.severity === 'warning') {
                    alertClass = 'border-orange-500/40 bg-orange-500/10 shadow-md shadow-orange-500/5 text-orange-300';
                    icon = <AlertTriangle size={22} className="text-orange-400 shrink-0" />;
                  } else {
                    alertClass = 'border-blue-500/30 bg-blue-500/5 text-blue-300';
                  }

                  return (
                    <div 
                      key={alert._id || alert.message}
                      className={`flex items-start md:items-center justify-between p-4.5 rounded-2xl border transition-all ${alertClass}`}
                    >
                      <div className="flex items-start md:items-center gap-4.5">
                        {icon}
                        <span className="text-white font-extrabold text-[15px] sm:text-base leading-relaxed">{alert.message}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all shrink-0 ml-4"
                        title="Dismiss alert"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                }) : (
                  <div className="text-center py-12 text-sm text-gray-500 italic">
                    No active warnings or alerts. Hospital is fully operational.
                  </div>
                )}
              </div>

              {/* Alert Creation Form */}
              <div className="border-t border-white/5 pt-4">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-2">Create Custom Facility Broadcast</span>
                <form onSubmit={handleAddAlert} className="flex gap-3">
                  <select 
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm({ ...alertForm, severity: e.target.value })}
                    className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-red-500 cursor-pointer transition-all hover:bg-white/10"
                    style={{ backgroundColor: '#121a28' }}
                  >
                    <option value="info" style={{ backgroundColor: '#121a28' }}>Info</option>
                    <option value="warning" style={{ backgroundColor: '#121a28' }}>Warning</option>
                    <option value="critical" style={{ backgroundColor: '#121a28' }}>Critical</option>
                  </select>
                  <input 
                    type="text"
                    placeholder="Type custom facility broadcast message here..."
                    value={alertForm.message}
                    onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-500 transition-all focus:bg-white/10"
                  />
                  <button 
                    type="submit" 
                    className="bg-[#000000] hover:bg-[#111111] text-white border border-white/10 hover:border-red-500/40 px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-black text-sm shadow-lg shadow-black/50"
                  >
                    <Send size={16} /> Broadcast
                  </button>
                </form>
              </div>
            </div>

            {/* Bento-Item 3: Blood Inventory Management (Col-span-8) */}
            <div className="bento-item col-span-8 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Droplets size={20} className="text-red-500" />
                    Live Blood Inventory Management
                  </h3>
                  <p className="text-xs text-gray-400">Configure real-time unit counts and status categories</p>
                </div>
                
                <span className="text-[10px] text-gray-400 font-medium">Click on units count to edit manually</span>
              </div>

              {/* Grid of Blood Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                {Object.keys(blood_inventory).map((bg) => {
                  const item = blood_inventory[bg];
                  const isEditing = editingGroup === bg;
                  
                  // Style colors based on Status
                  let statusBg = 'bg-green-500/10 text-green-400 border border-green-500/20';
                  let cardBorder = 'border-white/10';
                  if (item.status === 'CRITICAL') {
                    statusBg = 'bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse';
                    cardBorder = 'border-red-500/20 shadow-lg shadow-red-500/5';
                  } else if (item.status === 'LOW') {
                    statusBg = 'bg-orange-500/15 text-orange-400 border border-orange-500/20';
                    cardBorder = 'border-orange-500/20';
                  }

                  return (
                    <div 
                      key={bg} 
                      className={`flex flex-col items-center justify-between p-4 bg-white/5 rounded-2xl border transition-all hover:scale-[1.02] hover:bg-white/10 ${cardBorder}`}
                    >
                      {/* Blood Group and Status Badge */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xl font-black text-white">{bg}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${statusBg}`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Units display & input */}
                      <div className="my-3 flex items-center justify-center min-h-[50px]">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input 
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-16 bg-white/5 border border-white/20 text-white rounded-lg text-center font-bold text-lg focus:outline-none focus:border-red-500"
                              onKeyPress={(e) => e.key === 'Enter' && saveEditing(bg)}
                              autoFocus
                            />
                            <button 
                              onClick={() => saveEditing(bg)}
                              className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-lg text-xs font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => startEditing(bg, item.units)}
                            className="text-4xl font-black text-white hover:text-red-400 cursor-pointer transition-all select-none"
                            title="Click to edit manually"
                          >
                            {item.units}
                          </span>
                        )}
                      </div>

                      {/* Increments / Decrements */}
                      <div className="flex items-center gap-3 w-full border-t border-white/5 pt-3">
                        <button 
                          onClick={() => handleInventoryChange(bg, -1)}
                          disabled={item.units === 0}
                          className="flex-1 flex items-center justify-center p-1.5 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-all border border-white/5"
                        >
                          <Minus size={14} />
                        </button>
                        <button 
                          onClick={() => handleInventoryChange(bg, 1)}
                          className="flex-1 flex items-center justify-center p-1.5 bg-white/5 hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 rounded-lg transition-all border border-white/5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bento-Item 4: Inventory Summary Panel (Col-span-4) */}
            <div className="bento-item col-span-4 flex flex-col justify-between border border-white/10 bg-white/5">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white font-['Outfit']">Supply Summary</h3>
                    <p className="text-xs text-gray-400">Total capacity tracking metrics</p>
                  </div>
                </div>

                {/* Main Metric Card */}
                <div className="flex flex-col items-center justify-center py-8 border border-white/10 rounded-2xl bg-white/5 mb-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-6xl font-black text-white text-gradient-red drop-shadow-[0_0_15px_rgba(239,68,68,0.2)] tracking-tight">
                    {inventory_summary.total_units}
                  </span>
                  <span className="text-xs font-black text-gray-300 uppercase tracking-widest mt-2">
                    Total Capacity Units
                  </span>
                </div>

                {/* Status Breakdown Pills */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 transition-all hover:scale-[1.01] hover:bg-red-500/15">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-500/50 animate-pulse"></div>
                      <span className="text-sm font-extrabold text-red-300">Critical Shortages</span>
                    </div>
                    <span className="text-base font-black text-red-400">{inventory_summary.critical_count} Categories</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 transition-all hover:scale-[1.01] hover:bg-orange-500/15">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500 shadow-md shadow-orange-500/50"></div>
                      <span className="text-sm font-extrabold text-orange-300">Low Stock Categories</span>
                    </div>
                    <span className="text-base font-black text-orange-400">{inventory_summary.low_count} Categories</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 transition-all hover:scale-[1.01] hover:bg-green-500/15">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-md shadow-green-500/50"></div>
                      <span className="text-sm font-extrabold text-green-300">Safe Stock Categories</span>
                    </div>
                    <span className="text-base font-black text-green-400">{inventory_summary.safe_count} Categories</span>
                  </div>
                </div>
              </div>

              {/* Quick Restock Action */}
              <div className="mt-8 pt-4 border-t border-white/5">
                <button 
                  onClick={handleRestockAll}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center justify-center gap-2 text-xs"
                >
                  <PlusCircle size={16} /> Trigger Emergency Restock
                </button>
              </div>
            </div>

            {/* Bento-Item: Active Emergency SOS Requests (Col-span-12) */}
            <div className="bento-item col-span-12 mt-6 border border-red-500/30 bg-red-500/5 p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
                  <AlertTriangle size={24} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-['Outfit']">Active Emergency SOS Requests</h3>
                  <p className="text-xs text-red-400">Critical blood requests from local recipients requiring immediate response</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sosRequests.length > 0 ? sosRequests.map((req, i) => (
                  <div key={i} className="flex flex-col justify-between p-5 bg-[#121214] rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all shadow-md">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-white">{req.recipientId?.name || 'Emergency Request'}</span>
                        <span className="px-2.5 py-0.5 bg-red-500/10 text-red-400 text-xs font-black rounded-lg border border-red-500/25 uppercase tracking-wider animate-pulse">
                          {req.bloodType} Needed
                        </span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <MapPin size={12} className="text-red-500 shrink-0" />
                          <span className="truncate">{req.address || 'Address not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={12} className="text-red-500 shrink-0" />
                          <span>Submitted: {formatRelativeTime(req.createdAt)}</span>
                        </div>
                        {req.recipientId?.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-bold text-red-400">Phone:</span>
                            <span>{req.recipientId.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
                      {req.location?.coordinates && req.location.coordinates[0] !== 0 ? (
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${req.location.coordinates[1]},${req.location.coordinates[0]}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs font-bold text-red-400 hover:underline"
                        >
                          Get Dispatch Directions
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No GPS coordinates available</span>
                      )}
                      
                      <button 
                        onClick={() => handleResolveSos(req._id)}
                        disabled={resolvingId === req._id}
                        className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-500/20 ${
                          resolvingId === req._id
                            ? 'bg-gray-600 cursor-not-allowed opacity-70'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {resolvingId === req._id ? 'Resolving...' : 'Acknowledge & Resolve'}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-12 text-sm text-gray-500 italic">
                    No active emergency SOS broadcasts at the moment. All stable.
                  </div>
                )}
              </div>
            </div>

            {/* Bento-Item 5: Donation Intents Management Queue (Col-span-12) */}
            <div className="bento-item col-span-12 mt-6 border border-white/10 bg-white/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-3 rounded-2xl text-red-500 border border-red-500/20">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">Active Donation Intents Queue</h3>
                    <p className="text-xs text-gray-400">Review pending registrations and schedule arrivals</p>
                  </div>
                </div>

                {/* Queue Summary pills & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Summary counts */}
                  <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-1 px-2.5 rounded-xl text-[10px] font-bold text-gray-400">
                    <span>Pending: <strong className="text-yellow-400">{donation_intent_queue.pending_count}</strong></span>
                    <span>•</span>
                    <span>Approved: <strong className="text-green-400">{donation_intent_queue.approved_count}</strong></span>
                    <span>•</span>
                    <span>Rejected: <strong className="text-red-400">{donation_intent_queue.rejected_count}</strong></span>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase ${
                          filterStatus === status 
                            ? 'bg-red-500 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table / List Queue */}
              <div className="border border-white/5 rounded-2xl bg-white/2 max-h-[360px] overflow-y-auto custom-scrollbar">
                {filteredIntents.length > 0 ? (
                  <div className="w-full flex flex-col divide-y divide-white/5">
                    {/* Header Row */}
                    <div className="hidden sm:flex items-center justify-between p-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white/1">
                      <div className="w-1/4">Donor Name</div>
                      <div className="w-1/5">Donation Type</div>
                      <div className="w-1/6">Specific Detail</div>
                      <div className="w-1/6">Submission Time</div>
                      <div className="w-1/6">Status</div>
                      <div className="w-1/6 text-right">Actions</div>
                    </div>

                    {/* Data Rows */}
                    {filteredIntents.map((intent) => {
                      let statusBadge = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
                      if (intent.status === 'approved') statusBadge = 'bg-green-500/10 text-green-400 border border-green-500/20';
                      else if (intent.status === 'rejected') statusBadge = 'bg-red-500/10 text-red-400 border border-red-500/20';

                      return (
                        <div 
                          key={intent._id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 sm:gap-0 hover:bg-white/5 transition-all"
                        >
                          {/* Donor Name */}
                          <div className="w-full sm:w-1/4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-300">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{intent.donor_name}</p>
                              <span className="sm:hidden text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Clock size={10} /> {formatRelativeTime(intent.timestamp)}
                              </span>
                            </div>
                          </div>

                          {/* Donation Type */}
                          <div className="w-full sm:w-1/5 flex items-center">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg uppercase border ${
                              intent.type === 'blood' 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {intent.type}
                            </span>
                          </div>

                          {/* Specific Detail */}
                          <div className="w-full sm:w-1/6 text-sm font-semibold text-gray-200">
                            {intent.type === 'blood' ? (
                              <span className="flex items-center gap-1 text-red-400 font-bold">
                                <Heart size={12} fill="currentColor" /> {intent.blood_group}
                              </span>
                            ) : (
                              <span className="text-blue-400 font-bold">{intent.organ}</span>
                            )}
                          </div>

                          {/* Submission Time */}
                          <div className="hidden sm:block w-full sm:w-1/6 text-xs text-gray-400">
                            {formatRelativeTime(intent.timestamp)}
                          </div>

                          {/* Status */}
                          <div className="w-full sm:w-1/6">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${statusBadge}`}>
                              {intent.status}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="w-full sm:w-1/6 flex items-center justify-end gap-2">
                            {intent.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handleIntentStatusChange(intent._id, 'approved')}
                                  className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold transition-all uppercase"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleIntentStatusChange(intent._id, 'rejected')}
                                  className="px-2.5 py-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-red-500/30 uppercase"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic">No action needed</span>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-gray-500 italic">
                    No donation intents found matching this status filter.
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default HospitalDashboard;
