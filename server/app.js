import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);


if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'ShopKart API running' }));

export default app;