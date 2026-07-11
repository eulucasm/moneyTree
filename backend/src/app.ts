import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import syncRoutes from './routes/sync.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.disable('x-powered-by');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));

const allowedOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'https://moneytree-app-eight.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isLocal = origin.startsWith('http://localhost:') || 
                    origin.startsWith('http://127.0.0.1:') || 
                    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin);
                    
    // Obter domínios permitidos do .env (separados por vírgula)
    const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
                    
    if (isLocal || allowedOrigins.includes(origin) || envOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Acesso não permitido por política de CORS'));
  },
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Muitas requisições vindas deste IP. Por favor, tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  const authLog = authHeader 
    ? (authHeader.startsWith('Bearer ') ? '[PRESENT]' : '[INVALID]') 
    : '[NONE]';
  console.log(`[HTTP] ${req.method} ${req.url} - Auth: ${authLog}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Money Tree Sync API (Vercel Serverless) is active.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: process.env.npm_package_version || '1.0.0' });
});

export default app;
