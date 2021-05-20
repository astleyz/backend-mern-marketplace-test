import express from 'express';
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import CoursesController from '../controllers/courses.controller.js';

const app = express();
app.disable('x-powered-by');

// /courses/
app.get('/', CoursesController.getAll);

// /courses/create
app.post('/create', auth, CoursesController.create);

// /courses/:id
app
  .route('/:id')
  .get(CoursesController.getOne)
  .patch(auth, CoursesController.patchOne)
  .delete(auth, CoursesController.deleteOne);

// /courses/:id/:lesson
app.get('/:id/:lesson', [auth, role], CoursesController.getLesson);

// /courses/:id/:lesson
app.post('/:id/:lesson', [auth, role], CoursesController.postComment);

export default app;
