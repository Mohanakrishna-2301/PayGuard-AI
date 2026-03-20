const axios = require('axios');
const API = 'http://localhost:5000/api';

(async () => {
  try {
    // 1. Register Worker
    await axios.post(`${API}/auth/register`, {
      name: 'John Delivery',
      email: 'john@example.com',
      password: 'password123',
      location: 'Mumbai',
      role: 'worker'
    });
    console.log('Worker Registered');

    const loginWorker = await axios.post(`${API}/auth/login`, {
      email: 'john@example.com',
      password: 'password123'
    });
    const token = loginWorker.data.token;
    const workerId = loginWorker.data.user.id;
    
    // Admin login
    await axios.post(`${API}/auth/register`, {
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'adminpassword',
      role: 'admin'
    });

    const policy = await axios.post(`${API}/policy/subscribe`, {
      planName: 'Zomato Rain Protection',
      premiumAmount: 30,
      coverageAmount: 1500
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Policy Bought');

    const trigger = await axios.post(`${API}/trigger/simulate`, {
      targetUserId: workerId,
      weather_condition: 'heavy_rain',
      rainfall_mm: 80,
      aqi: 100,
      location: 'Mumbai'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Simulation Trigger:', trigger.data);

  } catch(e) {
    console.error('Test Failed:', e.response ? e.response.data : e.message);
  }
})();
