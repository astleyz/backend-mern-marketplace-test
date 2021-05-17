import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import coursesRoutes from './routes/courses.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
const PORT = process.env.API_PORT || 5900;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(cors());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/courses', coursesRoutes);

async function start() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      family: 4,
      autoIndex: false,
    });

    app.listen(PORT, () => console.log(`hello from ${PORT} ...`));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

start();
