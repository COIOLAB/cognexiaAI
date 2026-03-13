// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createOpenRouterAgent } from './ai/openrouter_agent.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenRouter agent
const openRouterAgent = createOpenRouterAgent(process.env.OPENROUTER_API_KEY);

// Routes
app.post('/api/chat/openrouter', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await openRouterAgent.ask(prompt);
    res.json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenRouter agent failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`EzAi backend running on port ${PORT}`);
});
