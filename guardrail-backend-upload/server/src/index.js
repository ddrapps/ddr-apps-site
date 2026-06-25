require('dotenv').config();
const express = require('express');
const cors = require('cors');
const placesRouter = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: allowedOrigin === '*' ? true : allowedOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'guardrail-backend' });
});

app.use('/api/places', placesRouter);

app.listen(PORT, () => {
  console.log(`Guardrail backend listening on port ${PORT}`);
});
