import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config.js';
import coursesRoutes from './routes/courses.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import jsonapi from './middleware/jsonapi.middleware.js';

dotenv.config();
const PORT = process.env.API_PORT || 4000;
const { UPLOAD_DESTIONATION } = config.constant;
const app = express();

app.use(`/${UPLOAD_DESTIONATION}`, express.static(`${UPLOAD_DESTIONATION}`));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(cors({ maxAge: 3600, credentials: true, origin: true }));

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'));
app.use(jsonapi);

app.use('/auth', authRoutes);
app.use('/courses', coursesRoutes);
app.use('/user', userRoutes);

async function start() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      family: 4,
      autoIndex: true,
    });

    app.listen(PORT, () => console.log(`hello from ${PORT} ...`));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

start();
