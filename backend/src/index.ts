import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectDB, disconnectDB } from './config/database';
import { JWT_SECRET } from './config/env';
import { sanitizeInput } from './middleware/sanitize';
import { generalLimiter } from './middleware/rateLimiters';
import bookingsRouter from './routes/bookings';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import adminUsersRouter from './routes/adminUsers';
import passwordResetRouter from './routes/passwordReset';
import notificationsRouter from './routes/notifications';
import reviewsRouter from './routes/reviews';

const app = express();
app.set('trust proxy', 1); // Required for rate limiting behind nginx
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

// ── Socket.io with JWT authentication ──────────────────────────────────────
export const io = new SocketServer(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
  transports: ['websocket', 'polling'],
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
  // Allow connection but mark as anonymous if no token (public pages need socket for notifications)
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; adminId?: string };
      socket.data.userId = decoded.userId ?? decoded.adminId;
      socket.data.isAdmin = !!decoded.adminId;
    } catch {
      // Token invalid — still allow connection as anonymous
    }
  }
  next();
});

io.on('connection', (socket) => {
  socket.on('join:user', (userId: string) => {
    if (socket.data.userId && socket.data.userId === userId) {
      void socket.join(`user:${userId}`);
    } else {
      console.warn('[SOCKET] join:user rejected: token/userId mismatch');
    }
  });
  socket.on('join:admin', () => {
    if (socket.data.isAdmin) {
      void socket.join('admin');
    }
  });
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
else app.use(morgan('combined'));
app.use(express.json({ limit: '10kb' }));
app.use(sanitizeInput);
app.use('/api', generalLimiter);

// ── Routes ─────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => { res.json({ status: 'healthy', timestamp: new Date().toISOString() }); });
app.use('/api/auth',           authRouter);
app.use('/api/users',          usersRouter);
app.use('/api/bookings',       bookingsRouter);
app.use('/api/password-reset', passwordResetRouter);
app.use('/api/notifications',  notificationsRouter);
app.use('/api/admin/users',    adminUsersRouter);
app.use('/api/reviews',        reviewsRouter);

// ── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => { res.status(404).json({ success: false, message: 'Not found' }); });

// ── Global Error Handler ───────────────────────────────────────────────────
app.use((err: Error & { status?: number; statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[GlobalError]', err);
  const status = err.status ?? err.statusCode ?? 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error');
  res.status(status).json({ success: false, message });
});

// ── Graceful shutdown ──────────────────────────────────────────────────────
function shutdown(): void {
  httpServer.close();
  void disconnectDB().then(() => { process.exit(0); });
}

// ── Start ──────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
  process.on('SIGTERM', shutdown);
}

void start().catch(console.error);
