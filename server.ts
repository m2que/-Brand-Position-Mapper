import express from 'express';
import dotenv from 'dotenv';
import http from 'node:http';
import path from 'node:path';
import brandMapHandler from './api/brand-map';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const port = 3001;

app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} -> ${res.statusCode}`);
  });
  next();
});

app.post('/api/brand-map', async (req, res) => {
  try {
    await brandMapHandler(
      {
        method: req.method,
        body: req.body
      },
      {
        setHeader: (name: string, value: string) => {
          res.setHeader(name, value);
        },
        status: (code: number) => ({
          json: (body: unknown) => {
            res.status(code).json(body);
          }
        })
      }
    );
  } catch (error) {
    console.error('Unhandled local API server error:', error);
    res.status(500).json({ error: 'Local API server error' });
  }
});

const server = http.createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`GEMINI_API_KEY present: ${Boolean(process.env.GEMINI_API_KEY)}`);
  console.log(`Local BPM API server running at http://0.0.0.0:${port}`);
});

server.on('error', (error) => {
  console.error('Local BPM API server failed:', error);
  process.exit(1);
});
