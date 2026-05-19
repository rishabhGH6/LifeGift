import express from 'express';
import authMiddleware from '../middleware/auth.js';
import RecipientProfile from '../models/RecipientProfile.js';
import SosRequest from '../models/SosRequest.js';
import Appointment from '../models/Appointment.js';
import HospitalProfile from '../models/HospitalProfile.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

/**
 * POST /api/recipient/onboard
 */
router.post('/onboard', authMiddleware, async (req, res) => {
  try {
    const { fullName, age, bloodType, gender, medicalCondition, urgencyLevel, coordinates, address } = req.body;

    let profile = await RecipientProfile.findOne({ userId: req.user.id });
    if (profile) {
      return res.status(400).json({ message: 'Recipient profile already exists.' });
    }

    profile = new RecipientProfile({
      userId: req.user.id,
      fullName,
      age,
      bloodType,
      gender,
      medicalCondition,
      urgencyLevel: urgencyLevel || 'Routine',
      location: {
        type: 'Point',
        coordinates
      },
      address
    });

    await profile.save();
    res.status(201).json({ message: 'Onboarding successful', profile });
  } catch (err) {
    console.error('Recipient Onboarding Error:', err);
    res.status(500).json({ message: 'Failed to complete onboarding' });
  }
});

/**
 * GET /api/recipient/check-blood/:bloodGroup
 * Check if the requested blood group is available in ANY hospital stock.
 */
router.get('/check-blood/:bloodGroup', authMiddleware, async (req, res) => {
  try {
    let { bloodGroup } = req.params;
    bloodGroup = decodeURIComponent(bloodGroup);

    // Default to false
    let available = false;

    // Find all hospitals
    const hospitals = await HospitalProfile.find({});
    
    for (const hospital of hospitals) {
      if (hospital.bloodInventory && hospital.bloodInventory[bloodGroup] > 0) {
        available = true;
        break;
      }
    }

    res.json({ available, bloodGroup });
  } catch (err) {
    console.error('Blood Check Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

/**
 * GET /api/recipient/profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await RecipientProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found', needsOnboarding: true });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Helper: Haversine distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * GET /api/recipient/nearby-hospitals
 * Fetch nearby hospitals and nursing homes
 */
router.get('/nearby-hospitals', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, radius = 20000 } = req.query;
    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    if (!lat || !lon) return res.status(400).json({ message: 'Location required' });

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    // 1. Concurrent Fetching from both APIs - STRICTLY Hospitals, Blood Banks, Nursing Homes
    const [googleRes, overpassRes] = await Promise.allSettled([
      fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&keyword=hospital|blood bank|nursing home&key=${apiKey}`),
      fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(`
        [out:json][timeout:25];
        (
          node["amenity"~"hospital|nursing_home"](around:${radius},${lat},${lon});
          way["amenity"~"hospital|nursing_home"](around:${radius},${lat},${lon});
          node["healthcare"~"hospital|blood_bank|nursing_home"](around:${radius},${lat},${lon});
          way["healthcare"~"hospital|blood_bank|nursing_home"](around:${radius},${lat},${lon});
        );
        out center tags;
      `.trim())}`, {
        headers: { 'User-Agent': 'LifeGift-BloodDonationApp/1.0' }
      })
    ]);

    let mergedHospitals = [];

    // Process Google Results
    if (googleRes.status === 'fulfilled' && googleRes.value.ok) {
      try {
        const gData = await googleRes.value.json();
        if (gData.status === 'OK' && gData.results) {
          gData.results.forEach(place => {
            mergedHospitals.push({
              id: place.place_id,
              name: place.name,
              lat: place.geometry.location.lat,
              lon: place.geometry.location.lng,
              address: place.vicinity,
              rating: place.rating,
              phone: 'Contact center',
              openNow: place.opening_hours?.open_now,
              source: 'google'
            });
          });
        }
        console.log(`Google Results: ${gData.results?.length || 0}`);
      } catch (e) { console.error('Google JSON Error'); }
    }

    // Process Overpass Results
    if (overpassRes.status === 'fulfilled' && overpassRes.value.ok) {
      try {
        const oData = await overpassRes.value.json();
        if (oData.elements) {
          const existingNames = new Set(mergedHospitals.map(h => h.name.toLowerCase()));
          oData.elements.forEach(el => {
            const name = el.tags?.name || el.tags?.['name:en'] || el.tags?.operator || 'Medical Facility';
            if (!existingNames.has(name.toLowerCase())) {
              mergedHospitals.push({
                id: el.id,
                name: name,
                lat: el.lat || el.center?.lat,
                lon: el.lon || el.center?.lon,
                address: el.tags ? `${el.tags['addr:street'] || ''} ${el.tags['addr:city'] || ''}`.trim() : 'Local facility',
                phone: el.tags?.phone || 'Contact center',
                rating: null,
                openNow: null,
                source: 'overpass'
              });
            }
          });
          console.log(`Overpass Elements Found: ${oData.elements.length}`);
        }
      } catch (e) { console.error('Overpass JSON Error'); }
    } else {
      console.warn('Overpass API Request Failed');
    }

    // Calculate Distance and Final Proximity Sorting with strict exclusions
    const finalResults = mergedHospitals
      .filter(h => {
        const name = h.name.toLowerCase();
        const isSpecializedExclusion = 
          name.includes('eye') || 
          name.includes('vision') || 
          name.includes('optometrist') || 
          name.includes('ent') || 
          name.includes('ear') || 
          name.includes('nose') || 
          name.includes('throat');
        return !isSpecializedExclusion;
      })
      .map(h => ({
        ...h,
        distance: getDistance(userLat, userLon, h.lat, h.lon)
      }))
      .filter(h => h.lat && h.lon)
      .sort((a, b) => a.distance - b.distance);

    console.log(`Final Merged Results: ${finalResults.length}`);
    res.json(finalResults);

  } catch (err) {
    console.error('Hospital Discovery Error:', err);
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});

/**
 * POST /api/recipient/sos
 * Creates an SOS Request
 */
router.post('/sos', authMiddleware, async (req, res) => {
  try {
    const profile = await RecipientProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const sos = new SosRequest({
      recipientId: req.user.id,
      bloodType: profile.bloodType,
      urgency: 'Emergency',
      location: profile.location,
      address: profile.address
    });
    
    await sos.save();
    res.json({ message: 'SOS Request successfully broadcasted to nearby donors and hospital admin.', sos });
  } catch (err) {
    console.error('SOS Error:', err);
    res.status(500).json({ message: 'Failed to send SOS' });
  }
});

/**
 * POST /api/recipient/ai-chat
 */
router.post('/ai-chat', authMiddleware, async (req, res) => {
  try {
    const { messages, recipientData } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI Assistant Error', error: 'Missing Gemini API Key' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const systemInstruction = `You are LifeGift's AI Health Assistant for Blood Recipients. Your goal is to support patients needing blood by answering their questions and guiding them.
Context about the recipient: Blood Type: ${recipientData?.bloodType || 'Unknown'}, Condition: ${recipientData?.medicalCondition || 'Unknown'}.
Be highly empathetic, calm, and reassuring. Offer helpful advice about preparing for blood transfusions or managing their condition. Ask ONE question at a time if you need more info. Do not overwhelm the user.`;

    // Format history (first message must be 'user')
    let formattedHistory = [];
    const historyMessages = messages.slice(0, -1);
    for (const msg of historyMessages) {
      const role = msg.role === 'model' ? 'model' : 'user';
      if (formattedHistory.length === 0 && role === 'model') {
        formattedHistory.push({ role: 'user', parts: [{ text: "Hello AI." }] });
      }
      formattedHistory.push({ role, parts: [{ text: msg.content }] });
    }

    const prompt = messages[messages.length - 1].content;

    // Try models in priority order — lite models have separate quotas
    const MODEL_PRIORITY = [
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-flash-lite-latest',
      'gemini-flash-latest',
    ];

    let lastError = null;
    for (const modelName of MODEL_PRIORITY) {
      try {
        console.log(`[Recipient AI] Trying model: ${modelName}`);
        const customModel = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction
        });
        const chat = customModel.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        console.log(`[Recipient AI] Success with model: ${modelName}`);
        return res.json({ content: response.text() });
      } catch (err) {
        console.warn(`[Recipient AI] Model ${modelName} failed: ${err.message?.slice(0, 80)}`);
        lastError = err;
        if (!err.message?.includes('429') && !err.message?.includes('quota')) {
          break;
        }
      }
    }

    throw lastError;
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ message: 'AI Assistant Error', error: err.message });
  }
});

/**
 * POST /api/recipient/save-ai-report
 */
router.post('/save-ai-report', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const profile = await RecipientProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { aiReports: { title, content, date: new Date() } } },
      { new: true }
    );
    res.json({ message: 'Report saved successfully', reports: profile.aiReports });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save report' });
  }
});

/**
 * GET /api/recipient/appointments
 */
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('Fetch Appointments Error:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

/**
 * POST /api/recipient/book-appointment
 */
router.post('/book-appointment', authMiddleware, async (req, res) => {
  try {
    const { hospitalName, date, time, purpose, id } = req.body;
    
    if (!hospitalName || !date || !time) {
      return res.status(400).json({ message: 'Hospital, date, and time are required' });
    }

    const newAppointment = new Appointment({
      userId: req.user.id,
      hospitalName,
      date,
      time,
      purpose: purpose || 'Transfusion Prep',
      id: id || Math.random().toString(36).substring(2, 9).toUpperCase()
    });

    await newAppointment.save();
    res.status(201).json({ message: 'Appointment successfully booked', appointment: newAppointment });
  } catch (err) {
    console.error('Book Appointment Error:', err);
    res.status(500).json({ message: 'Failed to save appointment' });
  }
});

export default router;
