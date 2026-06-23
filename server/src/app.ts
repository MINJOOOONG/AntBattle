import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// 미들웨어
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    disclaimer: '개미배틀은 투자 추천, 투자 자문, 자동매매, 금전 베팅을 제공하지 않습니다.',
  });
});

// API 라우트
app.use('/api', routes);

// 에러 핸들러 (반드시 마지막)
app.use(errorHandler);

export default app;
