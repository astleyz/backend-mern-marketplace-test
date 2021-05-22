import Course from '../models/course.js';
import User from '../models/user.js';
import Comment from '../models/comment.js';
import { fetchUdemyCourseAndParse } from '../services/fetchUdemyCourse.js';
import config from '../config.js';

export default class CoursesController {
  static async getAll(req, res) {
    let limit = config.constant.MAX_PAGINATION_LIMIT;
    let offset = Number(req.query.offset) || 0;

    try {
      const count = await Course.countDocuments();
      let courses = await Course.find()
        .skip(offset)
        .limit(limit)
        .lean()
        .select('id title subTitle img authorNames materials.info -_id');

      courses = courses.map(it => {
        it.fullLength = it.materials.info;
        delete it.materials;
        return it;
      });
      res.status(200).json({ count, courses });
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async create(req, res) {
    try {
      const courseUdemy = await fetchUdemyCourseAndParse(req.body.link);
      const course = new Course({ ...courseUdemy, ownerId: req.user._id });
      req.user.courses.push(course._id);
      await course.save();
      await req.user.save();
      res.status(201).json();
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ message: 'Course already exists' });
      if (e.response?.statusCode === 403) {
        return res.status(403).json({ message: 'Something wrong. Check the link or change ip' });
      }
      if (e.response?.statusCode === 404) {
        return res.status(404).json({ message: 'Link is not valid' });
      }
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async getOne(req, res) {
    try {
      const course = await Course.findOne(
        { id: req.params.id },
        { '_id': 0, 'materials.access': 0, 'materials.sections.lessons.comments': 0 }
      )
        .lean()
        .populate('ownerId', 'login -_id');

      if (!course) return res.status(404).json({ message: 'Not Found' });
      res.status(200).json(course);
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async patchOne(req, res) {
    try {
      const { id } = req.body;
      const user = await req.user.populate('courses').execPopulate();
      const editingCourse = user.courses.find(c => c.id === req.body.id);
      if (req.params.id !== id || !editingCourse) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await req.user.updateCourse(editingCourse, req.body);
      const updatedCourse = await Course.findOne(
        { id },
        { '_id': 0, 'materials.access': 0, 'materials.sections.lessons.comments': 0 }
      )
        .lean()
        .populate('ownerId', 'login -_id');
      res.status(200).json(updatedCourse);
    } catch (e) {
      if (e.message === 'Wrong user') res.status(400).json({ message: 'Such user is not exist' });
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async deleteOne(req, res) {
    try {
      let course = await Course.findOneAndDelete({
        id: req.params.id,
        ownerId: req.user._id,
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { courses: course._id },
      });
      if (!course) return res.status(403).json({ message: 'Forbidden' });
      res.status(200).json();
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async getLesson(req, res) {
    const { section: snumber, lesson: lnumber } = req.query;
    if (req.params.lesson !== 'showtopic') return res.status(404).json();
    try {
      const course = await Course.findOne({ id: req.params.id })
        .populate({
          path: 'materials.sections.lessons.comments',
          select: '-_id',
          populate: {
            path: 'ownerId',
            select: '-email -password -courses -_id',
          },
        })
        .lean();
      if (!course) return res.status(404).json();

      const lesson = {
        courseName: course.title,
        sectionName: course.materials.sections[`${snumber - 1}`].title,
        lessonName: course.materials.sections[`${snumber - 1}`].lessons[`${lnumber - 1}`].name,
        comments: course.materials.sections[`${snumber - 1}`].lessons[`${lnumber - 1}`].comments,
      };

      return res.status(200).json(lesson);
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async postComment(req, res) {
    const { section: snumber, lesson: lnumber } = req.query;
    if (req.params.lesson !== 'showtopic') return res.status(403).json();

    const comment = new Comment({
      ownerId: req.user._id,
      content: req.body.comment,
    });

    try {
      const course = await Course.findOne({ id: req.params.id });
      const { comments } = course.materials.sections[`${snumber - 1}`].lessons[`${lnumber - 1}`];

      comments.push(comment._id);
      await comment.save();
      await course.save();
      res.status(200).json();
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }
}
