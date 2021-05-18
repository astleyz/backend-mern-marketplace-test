import express from 'express';
import auth from '../middleware/auth.middleware.js';
import Course from '../models/course.js';
import Comment from '../models/comment.js';
import { fetchUdemyCourseAndParse } from '../services/fetchUdemyCourse.js';

const app = express();
app.disable('x-powered-by');

// /courses/
app.get('/', async (req, res) => {
  try {
    let courses = await Course.find()
      .lean()
      .select('id title subTitle img authorNames materials.info -_id');
    courses = courses.map(it => {
      it.fullLength = it.materials.info;
      delete it.materials;
      return it;
    });
    res.status(200).json(courses);
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// /courses/create
app.post('/create', auth, async (req, res) => {
  try {
    const courseUdemy = await fetchUdemyCourseAndParse(req.body.link);
    const course = new Course({ ...courseUdemy, ownerId: req.user._id });
    req.user.courses.push(course._id);
    await course.save();
    await req.user.save();
    res.status(201).json();
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'Course already exist' });
    if (e.response?.statusCode === 403) {
      return res.status(403).json({ message: 'Something wrong. Check the link or change ip' });
    }
    if (e.response?.statusCode === 404) {
      return res.status(404).json({ message: 'Link is not valid' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// /courses/:id
app
  .route('/:id')
  .get(async (req, res) => {
    try {
      const course = await Course.findOne({ id: req.params.id })
        .lean()
        .populate('ownerId', 'login -_id')
        .select('-comments, -_id');

      if (!course) return res.status(404).json({ message: 'Not Found' });
      res.status(200).json(course);
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  })
  .patch(auth, async (req, res) => {
    try {
      const { id } = req.body;
      const user = await req.user.populate('courses').execPopulate();
      const editingCourse = user.courses.find(c => c.id === req.body.id);
      if (req.params.id !== id || !editingCourse) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await req.user.updateCourse(editingCourse, req.body);
      const updatedCourse = await Course.findOne({ id })
        .lean()
        .populate('ownerId', 'login -_id')
        .select('-comments, -_id');
      res.status(202).json(updatedCourse);
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  })
  .delete(auth, async (req, res) => {
    try {
      let course = await Course.findOneAndRemove({
        id: req.params.id,
        ownerId: req.user._id,
      });
      if (!course) return res.status(403).json({ message: 'Forbidden' });
      res.status(202).json();
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
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
