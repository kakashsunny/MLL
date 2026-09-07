import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import app from './api-server';

const PORT = 3000;

async function startServer() {
  // Vite middleware for development vs production static serve
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuraForge server running on http://localhost:${PORT}`);
  });
}

startServer();
