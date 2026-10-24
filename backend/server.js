const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./src/config/db');
const webhookRoutes = require('./src/routes/webhookRoutes');
const flowRoutes = require('./src/routes/flowRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'ManyChat Clone Backend is running successfully!' });
});

app.use('/webhook', webhookRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/chat', chatRoutes);


const webhookController = require('./src/controllers/webhookController');
app.get('/webhook', webhookController.verifyWebhook);
app.post('/webhook', webhookController.handleWebhookEvent);

app.use('/api', require('./src/routes/pagesRoutes'));

app.use('/api/telegram', require('./src/routes/telegramRoutes'));
require('./src/services/telegramBot').startAll();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
