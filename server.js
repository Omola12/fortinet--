import { sql } from '@vercel/postgres';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/complaints', async (req, res) => {
  const { rows } = await sql`SELECT * FROM complaints ORDER BY created_at DESC`;
  res.json({ success: true, complaints: rows });
});

app.post('/api/complaints', async (req, res) => {
  const { name, email, subject, category, message } = req.body;
  const id = `FTNT-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  const { rows } = await sql`
    INSERT INTO complaints (id, name, email, subject, category, message)
    VALUES (${id}, ${name}, ${email}, ${subject}, ${category}, ${message})
    RETURNING id
  `;
  res.json({ success: true, id: rows[0].id });
});

// Add routes for reply, resolve, delete (same pattern)

export default app;
