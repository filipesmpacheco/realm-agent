require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pushController = require('./controllers/pushController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'realm-agent-push-gateway' });
});

// Push notification endpoint
app.post('/push/topic', pushController.sendToTopic);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Realm Agent Push Gateway rodando na porta ${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/push/topic`);
});
