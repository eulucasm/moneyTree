import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Disable x-powered-by header explicitly
app.disable('x-powered-by');

// Secure headers via Helmet (relaxed cross-origin policies for API access)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));

// Dynamic CORS configurations
const allowedOrigins = [
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:19006',
  'http://127.0.0.1:19006',
  'https://moneytree-app-eight.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like native mobile apps or backend-to-backend calls)
    if (!origin) return callback(null, true);
    
    const isLocal = origin.startsWith('http://localhost:') || 
                    origin.startsWith('http://127.0.0.1:') || 
                    origin.includes('192.168.');
                    
    if (isLocal || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Acesso não permitido por política de CORS'));
  },
  credentials: true,
}));

// Rate Limiter to prevent DOS / Bruteforce attacks (Allows 300 requests per 15 minutes)
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
    ? (authHeader.startsWith('Bearer ') ? `Bearer ${authHeader.substring(7, 18)}...` : '[INVALID]') 
    : '[NONE]';
  console.log(`[HTTP] ${req.method} ${req.url} - Auth: ${authLog}`);
  next();
});

// Initialize Firebase Admin (Optional, fallback to Dev Mock Mode if env is missing)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: (admin as any).credential.cert(serviceAccount),
    });
    console.log('[Firebase] Admin SDK initialized successfully.');
  } catch (err) {
    console.error('[Firebase] Failed to parse/initialize with SERVICE_ACCOUNT credentials:', err);
  }
} else {
  console.log('[Firebase] Running in DEV/MOCK authentication mode. Set FIREBASE_SERVICE_ACCOUNT to enable token verification.');
}

// Helper to decode JWT payload without verification (for local development mock mode)
const decodeJwtWithoutVerification = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadBase64 = parts[1];
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('[Auth] Failed to decode JWT locally:', err);
    return null;
  }
};

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Dev Mock Authentication (e.g. Bearer mock-uid-12345)
  if (token.startsWith('mock-uid-')) {
    req.userId = token.replace('mock-uid-', '');
    return next();
  }

  // Firebase Real Authentication
  try {
    // If running in local DEV/MOCK mode without Firebase service account, extract uid from token payload directly
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      const decoded = decodeJwtWithoutVerification(token);
      if (decoded && decoded.sub) {
        req.userId = decoded.sub;
        return next();
      }
      return res.status(401).json({ error: 'Invalid local/mock token structure' });
    }

    const decodedToken = await (admin as any).auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    next();
  } catch (err) {
    console.error('[Auth] Token verification failed:', err);
    return res.status(401).json({ error: 'Unauthorized/Invalid token' });
  }
};

// Endpoints

// 1. GET /api/user/profile - Fetch profile
app.get('/api/user/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create profile dynamically on first request
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          firstName: '',
          lastName: '',
          city: '',
          state: '',
          loginType: 'email',
          activePlan: 'free',
          role: 'user',
          status: 'active',
          savingsGoal: 0,
          language: 'pt',
          phone: '',
          birthDate: '',
          createdAt: new Date().toISOString().substring(0, 7), // "YYYY-MM"
        },
      });
    }

    return res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      state: user.state,
      loginType: user.loginType,
      activePlan: user.activePlan,
      role: user.role,
      status: user.status,
      savingsGoal: user.savingsGoal,
      language: user.language,
      phone: user.phone || '',
      birthDate: user.birthDate || '',
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    console.error('[Profile] Error fetching/creating user profile:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 2. PUT /api/user/profile - Update profile
app.put('/api/user/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { firstName, lastName, city, state, loginType, activePlan, role, status, savingsGoal, language, phone, birthDate } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        firstName,
        lastName,
        city,
        state,
        loginType,
        activePlan,
        role,
        status,
        savingsGoal: savingsGoal !== undefined ? parseFloat(savingsGoal) : undefined,
        language,
        phone,
        birthDate,
      },
      create: {
        id: userId,
        firstName: firstName || '',
        lastName: lastName || '',
        city: city || '',
        state: state || '',
        loginType: loginType || 'email',
        activePlan: activePlan || 'free',
        role: role || 'user',
        status: status || 'active',
        savingsGoal: savingsGoal !== undefined ? parseFloat(savingsGoal) : 0,
        language: language || 'pt',
        phone: phone || '',
        birthDate: birthDate || '',
        createdAt: new Date().toISOString().substring(0, 7),
      },
    });

    return res.json(user);
  } catch (err: any) {
    console.error('[Profile] Error updating profile:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 3. DELETE /api/user/profile - Delete account
app.delete('/api/user/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    return res.json({ success: true, message: 'User account wiped successfully.' });
  } catch (err: any) {
    console.error('[Profile] Error deleting account:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 4. GET /api/sync - Pull all user data
app.get('/api/sync', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        entries: true,
        exits: true,
        recurrings: true,
        purchases: true,
        savingsItems: true,
        creditCards: true,
        installmentStatusMap: true,
      },
    });

    if (!user) {
      return res.json({
        entries: [],
        exits: [],
        recurrings: [],
        purchases: [],
        savingsLogs: {},
        creditCards: [],
        savingsGoal: 0,
        language: 'pt',
        installmentStatusMap: {},
        userProfile: null,
      });
    }

    // Reconstruct savingsLogs map
    const savingsLogs: Record<string, any[]> = {};
    for (const item of user.savingsItems) {
      if (!savingsLogs[item.monthStr]) {
        savingsLogs[item.monthStr] = [];
      }
      savingsLogs[item.monthStr].push({
        id: item.id,
        type: item.type,
        bank: item.bank,
        amount: item.amount,
        description: item.description,
      });
    }

    // Reconstruct installmentStatusMap
    const installmentStatusMap: Record<string, string> = {};
    for (const inst of user.installmentStatusMap) {
      const key = `${inst.purchaseId}_${inst.date}`;
      installmentStatusMap[key] = inst.status;
    }

    return res.json({
      entries: user.entries,
      exits: user.exits,
      recurrings: user.recurrings,
      purchases: user.purchases.map((p: any) => ({
        id: p.id,
        description: p.description,
        totalValue: p.totalValue,
        monthlyValue: parseFloat((p.totalValue / p.installments).toFixed(2)),
        installments: p.installments,
        startDate: p.startDate,
        cardUsed: p.cardUsed,
      })),
      savingsLogs,
      creditCards: user.creditCards,
      savingsGoal: user.savingsGoal,
      language: user.language,
      installmentStatusMap,
      userProfile: {
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        state: user.state,
        loginType: user.loginType,
        activePlan: user.activePlan,
        role: user.role,
        status: user.status,
        phone: user.phone || '',
        birthDate: user.birthDate || '',
        createdAt: user.createdAt,
      },
      updatedAt: user.updatedAt.getTime(),
    });
  } catch (err: any) {
    console.error('[Sync] Error pulling user data:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 5. POST /api/sync - Push all local user data
app.post('/api/sync', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const {
    entries = [],
    exits = [],
    recurrings = [],
    purchases = [],
    savingsLogs = {},
    creditCards = [],
    savingsGoal = 0,
    language = 'pt',
    installmentStatusMap = {},
    userProfile = null,
  } = req.body;

  try {
    // 1. Flatten savingsLogs map
    const savingsItemsList: any[] = [];
    for (const [monthStr, items] of Object.entries(savingsLogs)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          savingsItemsList.push({
            id: item.id,
            monthStr,
            type: item.type,
            bank: item.bank,
            amount: item.amount,
            description: item.description,
          });
        }
      }
    }

    // 2. Flatten installmentStatusMap
    const installmentStatusList: any[] = [];
    for (const [key, status] of Object.entries(installmentStatusMap)) {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const purchaseId = parts[0];
        const date = parts.slice(1).join('_');
        installmentStatusList.push({
          purchaseId,
          date,
          status,
        });
      }
    }

    // 3. Execute transactional updates
    await prisma.$transaction(async (tx: any) => {
      // Upsert user profile
      const prof = userProfile || {};
      await tx.user.upsert({
        where: { id: userId },
        update: {
          firstName: prof.firstName !== undefined ? prof.firstName : undefined,
          lastName: prof.lastName !== undefined ? prof.lastName : undefined,
          city: prof.city !== undefined ? prof.city : undefined,
          state: prof.state !== undefined ? prof.state : undefined,
          loginType: prof.loginType !== undefined ? prof.loginType : undefined,
          activePlan: prof.activePlan !== undefined ? prof.activePlan : undefined,
          role: prof.role !== undefined ? prof.role : undefined,
          status: prof.status !== undefined ? prof.status : undefined,
          savingsGoal: parseFloat(savingsGoal),
          language,
          phone: prof.phone !== undefined ? prof.phone : undefined,
          birthDate: prof.birthDate !== undefined ? prof.birthDate : undefined,
        },
        create: {
          id: userId,
          firstName: prof.firstName || '',
          lastName: prof.lastName || '',
          city: prof.city || '',
          state: prof.state || '',
          loginType: prof.loginType || 'email',
          activePlan: prof.activePlan || 'free',
          role: prof.role || 'user',
          status: prof.status || 'active',
          savingsGoal: parseFloat(savingsGoal),
          language,
          phone: prof.phone || '',
          birthDate: prof.birthDate || '',
          createdAt: prof.createdAt || new Date().toISOString().substring(0, 7),
        },
      });

      // Clear & Insert Entries
      await tx.entry.deleteMany({ where: { userId } });
      if (entries.length > 0) {
        await tx.entry.createMany({
          data: entries.map((e: any) => ({
            id: e.id,
            userId,
            description: e.description,
            value: parseFloat(e.value),
            date: e.date,
            status: e.status,
          })),
        });
      }

      // Clear & Insert Exits
      await tx.exit.deleteMany({ where: { userId } });
      if (exits.length > 0) {
        await tx.exit.createMany({
          data: exits.map((e: any) => ({
            id: e.id,
            userId,
            description: e.description,
            value: parseFloat(e.value),
            date: e.date,
            status: e.status,
            category: e.category,
            dueDate: e.dueDate !== undefined ? parseInt(e.dueDate) : null,
          })),
        });
      }

      // Clear & Insert Recurrings
      await tx.recurring.deleteMany({ where: { userId } });
      if (recurrings.length > 0) {
        await tx.recurring.createMany({
          data: recurrings.map((r: any) => ({
            id: r.id,
            userId,
            description: r.description,
            value: parseFloat(r.value),
          })),
        });
      }

      // Clear & Insert Purchases
      await tx.purchase.deleteMany({ where: { userId } });
      if (purchases.length > 0) {
        await tx.purchase.createMany({
          data: purchases.map((p: any) => ({
            id: p.id,
            userId,
            description: p.description,
            totalValue: parseFloat(p.totalValue),
            installments: parseInt(p.installments),
            startDate: p.startDate,
            cardUsed: p.cardUsed,
          })),
        });
      }

      // Clear & Insert SavingsItems
      await tx.savingsItem.deleteMany({ where: { userId } });
      if (savingsItemsList.length > 0) {
        await tx.savingsItem.createMany({
          data: savingsItemsList.map((s: any) => ({
            id: s.id,
            userId,
            monthStr: s.monthStr,
            type: s.type,
            bank: s.bank,
            amount: parseFloat(s.amount),
            description: s.description,
          })),
        });
      }

      // Clear & Insert CreditCards
      await tx.creditCard.deleteMany({ where: { userId } });
      if (creditCards.length > 0) {
        await tx.creditCard.createMany({
          data: creditCards.map((c: any) => ({
            id: c.id,
            userId,
            name: c.name,
            limit: parseFloat(c.limit),
            color: c.color,
            dueDate: c.dueDate !== undefined ? parseInt(c.dueDate) : null,
            bestPurchaseDay: c.bestPurchaseDay !== undefined ? parseInt(c.bestPurchaseDay) : null,
          })),
        });
      }

      // Clear & Insert InstallmentStatusMap
      await tx.installmentStatus.deleteMany({ where: { userId } });
      if (installmentStatusList.length > 0) {
        await tx.installmentStatus.createMany({
          data: installmentStatusList.map((i: any) => ({
            userId,
            purchaseId: i.purchaseId,
            date: i.date,
            status: i.status,
          })),
        });
      }
    });

    return res.json({ success: true, timestamp: Date.now() });
  } catch (err: any) {
    console.error('[Sync] Error pushing user data:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Admin endpoints (require user.role === 'admin')
const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error in admin verification' });
  }
};

// 6. GET /api/admin/users - Fetch all users
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        state: true,
        loginType: true,
        activePlan: true,
        role: true,
        status: true,
        phone: true,
        birthDate: true,
        createdAt: true,
      }
    });

    // Format output to match old Firebase array structure
    const formatted = users.map((u: any) => ({
      id: u.id,
      userProfile: {
        firstName: u.firstName,
        lastName: u.lastName,
        city: u.city,
        state: u.state,
        loginType: u.loginType,
        activePlan: u.activePlan,
        role: u.role,
        status: u.status,
        phone: u.phone || '',
        birthDate: u.birthDate || '',
        createdAt: u.createdAt,
      }
    }));

    return res.json(formatted);
  } catch (err: any) {
    console.error('[Admin] Error fetching all users:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 7. PUT /api/admin/users/:userId/plan - Change plan
app.put('/api/admin/users/:userId/plan', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { activePlan } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: userId as string },
      data: { activePlan },
    });
    return res.json(updated);
  } catch (err: any) {
    console.error('[Admin] Error updating user plan:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 8. PUT /api/admin/users/:userId/suspension - Suspend / Unsuspend
app.put('/api/admin/users/:userId/suspension', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body; // 'active' | 'suspended'
  try {
    const updated = await prisma.user.update({
      where: { id: userId as string },
      data: { status },
    });
    return res.json(updated);
  } catch (err: any) {
    console.error('[Admin] Error toggling suspension:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// 9. DELETE /api/admin/users/:userId - Delete/wipe user completely
app.delete('/api/admin/users/:userId', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({
      where: { id: userId as string },
    });
    return res.json({ success: true });
  } catch (err: any) {
    console.error('[Admin] Error deleting user:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Root check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Money Tree Sync API (Vercel Serverless) is active.' });
});

// Server start for local development
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[Server] Local server running on http://localhost:${PORT}`);
});

export default app;
