const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User, Policy, Transaction, Trigger } = require('./models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpayguardkey';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

// Middleware for auth
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// --- AUTH --- //
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, location, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'worker';
    const user = new User({ name, email, password: hashedPassword, location, role: userRole });
    await user.save();
    
    res.json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- USER DASHBOARD --- //
router.get('/user/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const activePolicy = await Policy.findOne({ userId: req.user.id, isActive: true });
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 }).limit(10);
    const triggers = await Trigger.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(5);
    
    res.json({
      user,
      activePolicy,
      transactions,
      recentTriggers: triggers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- POLICIES --- //
router.post('/policy/subscribe', authMiddleware, async (req, res) => {
  try {
    const { planName, premiumAmount, coverageAmount } = req.body;
    
    // Deactivate previous active policies
    await Policy.updateMany({ userId: req.user.id, isActive: true }, { isActive: false });
    
    // Create new weekly policy
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days from now
    
    const policy = new Policy({
      userId: req.user.id,
      planName: planName || 'Standard Weekly',
      premiumAmount: premiumAmount || 30, // Default 30 INR
      coverageAmount: coverageAmount || 1000,
      endDate
    });
    
    await policy.save();
    res.json({ message: 'Subscribed to policy successfully', policy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TRIGGER ENGINE (Mocking External Weather Event) --- //
router.post('/trigger/simulate', authMiddleware, async (req, res) => {
  try {
    // If it's the admin or a user simulating the weather for demo purposes
    const { weather_condition, rainfall_mm, aqi, location, targetUserId } = req.body;
    
    const userIdToTrigger = targetUserId || req.user.id;
    const user = await User.findById(userIdToTrigger);
    
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    const activePolicy = await Policy.findOne({ userId: userIdToTrigger, isActive: true });
    
    if (!activePolicy) {
      return res.status(400).json({ message: 'User has no active policy to trigger.' });
    }
    
    // 1. Check AI Risk Prediction
    const riskPayload = { weather_condition, rainfall_mm, aqi, location: location || user.location };
    let riskResponse;
    try {
      riskResponse = await axios.post(`${AI_SERVICE_URL}/predict/risk`, riskPayload);
    } catch(err) {
      return res.status(500).json({ message: 'Error contacting AI Service' });
    }
    
    const { risk_score, risk_level, trigger_payout } = riskResponse.data;
    
    if (trigger_payout) {
      // 2. Predict lost income
      const incomePayload = {
        user_id: userIdToTrigger.toString(),
        time_of_day: "afternoon",
        location: location || user.location,
        historical_avg_income: 1000 // Mock avg INR/day
      };
      const incomeResponse = await axios.post(`${AI_SERVICE_URL}/predict/income`, incomePayload);
      const predicted_income = incomeResponse.data.predicted_daily_income;
      
      // 3. Optional Fraud check
      const fraudPayload = {
        user_id: userIdToTrigger.toString(),
        gps_coordinates: "19.0760,72.8777", // standard location coords for demo
        claim_frequency_30d: 1, 
        is_device_rooted: false
      };
      const fraudResponse = await axios.post(`${AI_SERVICE_URL}/detect/fraud`, fraudPayload);
      
      if (fraudResponse.data.is_fraudulent) {
        return res.json({ message: 'Claim denied due to suspicious activity.', fraud_flags: fraudResponse.data.flags });
      }
      
      // 4. Calculate Payout
      let payout = predicted_income * 0.8;
      if (payout > activePolicy.coverageAmount) {
        payout = activePolicy.coverageAmount;
      }
      
      // 5. Update Wallet & DB
      user.walletBalance += payout;
      await user.save();
      
      await Transaction.create({
        userId: userIdToTrigger,
        type: 'credit',
        amount: payout,
        description: `Auto-Payout due to ${weather_condition} (${risk_level} Risk)`
      });
      
      const trigger = await Trigger.create({
        userId: userIdToTrigger,
        eventType: weather_condition,
        riskScore: risk_score,
        aiPrediction: { ...riskResponse.data, ...incomeResponse.data },
        payoutAmount: payout
      });
      
      return res.json({
        success: true,
        message: `Event processed: ${risk_level} risk detected. Payout of ₹${payout.toFixed(2)} credited to wallet!`,
        data: trigger
      });
    }
    
    return res.json({
      success: true,
      message: `Event processed. Risk level is ${risk_level}. No payout required.`,
      risk_score
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// --- ADMIN API --- //
router.get('/admin/stats', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    
    const usersCount = await User.countDocuments();
    const activePolicies = await Policy.countDocuments({ isActive: true });
    const triggers = await Trigger.find().populate('userId', 'name email').sort({ timestamp: -1 }).limit(10);
    const transactions = await Transaction.find({ type: 'credit' });
    const totalPayouts = transactions.reduce((acc, t) => acc + t.amount, 0);
    
    // Aggregating some stats for graphs if needed
    
    res.json({
      usersCount,
      activePolicies,
      totalPayouts,
      recentTriggers: triggers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
