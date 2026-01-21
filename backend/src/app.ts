import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import session from 'express-session';

import config, { isProduction } from '@config/environment';
import { API_PREFIX } from '@config/constants';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';
import {
  comprehensiveSecurityMiddleware,
  sanitizeResponse,
  rateLimiters,
  csrfProtection,
  securityHeaders,
} from '@middleware/securityMiddleware';
import logger from '@utils/logger';
import routes from '@routes/index';
import storesExistsRouter from './routes/stores-exists';

const app: Express = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Session-Id'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(
  session({
    secret: process.env.SESSION_SECRET || '6f91bc1ecc37067446dcbd6af83eec73d2a97dceb167da3b8a0547c4d5a5864c',
    resave: false,
    saveUninitialized: true,
     cookie: {
     secure: true,
     httpOnly: true,
     sameSite:'none',
     maxAge: 24 * 60 * 60 * 1000,
   },
  })
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(securityHeaders);

app.use(comprehensiveSecurityMiddleware);

app.use(sanitizeResponse);

const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(`${API_PREFIX}/`, limiter);

app.get('/', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    service: 'eishro-backend',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health'
    },
    timestamp: new Date().toISOString(),
    environment: config.environment
  });
});

app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    skipDbInit: process.env.SKIP_DB_INIT === 'true'
  });
});

app.get('/api/health', (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    skipDbInit: process.env.SKIP_DB_INIT === 'true'
  });
});

let basePath = process.cwd();
if (basePath.endsWith('backend')) {
  basePath = path.join(basePath, '..');
}

const publicPath = path.join(basePath, 'backend', 'public');
const assetsPath = path.join(publicPath, 'assets');

logger.info(`📁 Static assets configuration:`);
logger.info(`   Base Path: ${basePath}`);
logger.info(`   Public Path: ${publicPath}`);
logger.info(`   Assets Path: ${assetsPath}`);

app.use('/assets', express.static(assetsPath, { 
  maxAge: '1h',
  etag: false,
  dotfiles: 'allow'
}));

app.use('/', express.static(publicPath, {
  maxAge: '1d',
  etag: false
}));

app.use((req: Request, res: Response, next: NextFunction): void => {
  if (!req.path.startsWith('/api')) {
    logger.info(`${req.method} ${req.path}`);
  }
  next();
});

app.use('/api/stores-exists', storesExistsRouter);
app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
