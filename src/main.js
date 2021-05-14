import express from 'express';
import coursesRoutes from './routes/courses.routes';
import authRoutes from './routes/auth.routes';

const PORT = process.env.API_PORT || 5900;

const app = express();
app.disable('x-powered-by');

app.use('/courses', coursesRoutes);
app.use('/auth', authRoutes);

function start() {
  try {
    app.listen(PORT, () => console.log(`hello from ${PORT} ...`));
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

start();
