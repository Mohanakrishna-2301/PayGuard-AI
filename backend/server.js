const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set mongoose option to suppress strictQuery warning
mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payguard', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected to PayGuard DB'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('PayGuard API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
