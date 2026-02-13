import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import repoRoutes from './routes/repos';
import { rateLimit } from './middleware/rateLimit';
import type { ApiResponse } from '../shared/types';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(rateLimit);

// Routes
app.use('/api/repos', repoRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint was not found.',
    },
    meta: {
      timestamp: new Date().toISOString(),
      fromCache: false,
    },
  };
  res.status(404).json(response);
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);

  const response: ApiResponse<never> = {
    success: false,
    error: {
      code: 'API_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred.'
        : err.message,
    },
    meta: {
      timestamp: new Date().toISOString(),
      fromCache: false,
    },
  };
  res.status(500).json(response);
});

// Start server only when run directly (not imported for testing)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? 'set' : 'NOT SET'}`);
  });
}

export { app };
