const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const botRoutes = require('./routes/botRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes Integration
app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);

app.get('/', (req, res) => {
    res.send('FlowBot Backend Engine is Running & Ready for DB connection!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
