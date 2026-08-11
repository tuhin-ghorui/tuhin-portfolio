// api/messages.js
// Vercel serverless function — receives the portfolio contact form
// submissions and stores them in MongoDB (Atlas free tier works fine).
//
// Required environment variables (set in Vercel → Project → Settings → Environment Variables):
//   MONGODB_URI  — your Atlas connection string, e.g.
//                  mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
//   MONGODB_DB   — database name to use (optional, defaults to "portfolio")
//
// After deploying, submissions land in the "messages" collection of that database.

const { MongoClient } = require('mongodb');

// Reused across warm serverless invocations so we don't open a new
// connection on every request.
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(process.env.MONGODB_DB || 'portfolio');
  return cachedDb;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  // Basic CORS — the form is served from the same origin in normal use,
  // this just keeps things working if you ever test from elsewhere.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const { name, email, message, company } = body;

  // Honeypot — real visitors never see or fill this field. If it has a
  // value, silently pretend success so bots don't learn to avoid it.
  if (company) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  const cleanName = String(name).trim().slice(0, 100);
  const cleanEmail = String(email).trim().slice(0, 200);
  const cleanMessage = String(message).trim().slice(0, 2000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ error: 'name, email and message cannot be empty' });
  }

  if (!EMAIL_RE.test(cleanEmail)) {
    return res.status(400).json({ error: 'that email address doesn\'t look right' });
  }

  try {
    const db = await getDb();

    // Very light throttle: block a 5th message from the same email within 10 minutes.
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = await db.collection('messages').countDocuments({
      email: cleanEmail,
      createdAt: { $gte: tenMinAgo }
    });
    if (recentCount >= 5) {
      return res.status(429).json({ error: 'too many messages sent recently — try again later' });
    }

    await db.collection('messages').insertOne({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      createdAt: new Date(),
      userAgent: req.headers['user-agent'] || null,
      ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('messages api error:', err);
    return res.status(500).json({ error: 'something went wrong on our end — try again shortly' });
  }
};
