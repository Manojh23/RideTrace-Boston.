import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { attachVisitor } from './auth/visitor.js';
import { commuteRoutes } from './features/manoj/commutes.js';
import { stopRoutes } from './routes/stops.js';

const publicDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

export function createApp(db, config) {
  const app = express();
  app.disable('x-powered-by');
  if (config.production) app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    );
    next();
  });
  // Establish the signed browser identity on the initial HTML response, before parallel API requests.
  app.use(attachVisitor(config.secret, config.production));
  app.use(express.json({ limit: '15kb' }));
  app.get('/api/health', async (_req, res) => {
    await db.command({ ping: 1 });
    res.json({ status: 'ok', service: 'RideTrace Boston' });
  });
  app.use('/api/commutes', commuteRoutes(db, express.Router));
  app.use('/api/stops', stopRoutes(db, express.Router));
  app.use(
    express.static(publicDirectory, {
      extensions: ['html'],
      index: 'index.html',
      maxAge: config.production ? '1h' : 0,
    }),
  );
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
  app.use((err, _req, res, _next) => {
    if (res.headersSent) return;
    const code = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
    if (code >= 500) console.error(err);
    res.status(code).json({ error: code >= 500 ? 'Unexpected server error.' : err.message });
  });
  return app;
}
