const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
  walletBalance: { type: Number, default: 0 },
  location: { type: String, default: 'Mumbai' },
  createdAt: { type: Date, default: Date.now }
});

const policySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName: { type: String, required: true },
  premiumAmount: { type: Number, required: true },
  coverageAmount: { type: Number, required: true }, // Max payout limit
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit'] },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
});

const triggerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  eventType: { type: String, required: true },
  riskScore: { type: Number, required: true },
  aiPrediction: { type: Object },
  payoutAmount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Policy: mongoose.model('Policy', policySchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
  Trigger: mongoose.model('Trigger', triggerSchema)
};
