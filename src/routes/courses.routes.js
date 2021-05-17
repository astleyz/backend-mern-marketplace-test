import express from 'express';
import auth from '../middleware/auth.middleware.js';
import Course from '../models/course.js';
import Comment from '../models/comment.js';

const app = express();
app.disable('x-powered-by');

// /courses/
app.get('/', async (req, res) => {
  try {
    const courses = await Course.find().lean().populate('ownerId', 'title description videoLength');
    res.status(200).json(courses);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// /courses/create   создать новый курс, юзер должен быть авторизован
app.post('/create', auth, async (req, res) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      author: req.body.author,
      videoLength: req.body.videoLength,
    });
    // await course.save();
    res.status(201).json(course);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// /courses/:id
app
  .route('/:id')
  .get(async (req, res) => {
    // отдать курс по айди
    try {
      const course = await Course.findById(req.params.id).lean();
      res.status(200).json(course);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  })
  .patch(auth, async (req, res) => {
    // юзер редактирует свой курс
    try {
      const course = await Course.findByIdAndUpdate(req.params.id, req.body);
      res.status(202).json(course);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  })
  .delete(auth, async (req, res) => {
    // юзер удаляет свой курс
    try {
      await Course.findByIdAndRemove(req.params.id);
      res.status(202);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

// /courses/:id/:lesson/comments
app.get('/:id/:lesson/comments', auth, async (req, res) => {
  // получить все комменты к занятию
});

// /courses/:id/:lesson/comment    оставить коммент к занятию
app.post('/:id/:lesson/comment', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const comment = new Comment({
      author: req.user,
      content: req.body,
    });
    course.lessons.find(lesson => {
      if (lesson.title === req.params.lesson) {
        course.lessons.comments.push(comment);
      }
    });
    await comment.save();
    await course.save();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default app;
