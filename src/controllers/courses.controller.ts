import type { Request, Response } from 'express';
import Course, { CourseSchemaType, ICourseSchema } from '../models/course';
import User, { IUserSchema } from '../models/user';
import Comment from '../models/comment';
import { fetchUdemyCourseAndParse } from '../services/fetchUdemyCourse';
import config from '../config';
import type { PutchingCourseType } from '../interfaces';

type CourseType = Pick<
  CourseSchemaType,
  'id' | 'title' | 'subTitle' | 'img' | 'authorNames' | 'materials'
> & { fullLength: string } & { materials?: any };

type UserPopulated = IUserSchema & {
  courses: any[];
};

export default class CoursesController {
  static async getAll(req: Request, res: Response): Promise<Response<any>> {
    let limit = config.constant.MAX_PAGINATION_LIMIT;
    let offset = Number(req.query.offset) || 0;

    try {
      const count = await Course.countDocuments();
      let courses: CourseType[] = await (<any>(
        Course.find()
          .skip(offset)
          .limit(limit)
          .lean()
          .select('id title subTitle img authorNames materials.info -_id')
      ));

      courses = courses.map(it => {
        it.fullLength = it.materials.info;
        delete it.materials;
        return it;
      });
      return res.status(200).json({ count, courses });
    } catch (e) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async create(req: Request, res: Response): Promise<Response<any>> {
    try {
      const courseUdemy = await fetchUdemyCourseAndParse(req.body.link);
      const course = new Course({ ...courseUdemy, ownerId: req.user!._id });
      req.user!.courses.push(course._id);
      await course.save();
      await req.user!.save();
      return res.status(201).json();
    } catch (e) {
      if (e.code === 11000) return res.status(409).json({ message: 'Course already exists' });
      if (e.response?.statusCode === 403) {
        return res.status(403).json({ message: 'Something wrong. Check the link or change ip' });
      }
      if (e.response?.statusCode === 404) {
        return res.status(404).json({ message: 'Link is not valid' });
      }
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async getOne(req: Request<{ id: string }>, res: Response): Promise<Response<any>> {
    try {
      const course = await Course.findOne(
        { id: req.params.id },
        { '_id': 0, 'materials.access': 0, 'materials.sections.lessons.comments': 0 }
      )
        .lean()
        .populate('ownerId', 'login -_id');

      if (!course) return res.status(404).json({ message: 'Course not found' });
      return res.status(200).json(course);
    } catch (e) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async patchOne(
    req: Request<{ id: string }, {}, PutchingCourseType>,
    res: Response
  ): Promise<Response<any>> {
    try {
      const { id } = req.body;
      const user: UserPopulated = await req.user!.populate('courses').execPopulate();
      const editingCourse = (<ICourseSchema[]>user.courses).find(c => c.id === req.body.id);
      if (req.params.id !== id || !editingCourse) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await req.user!.updateCourse(editingCourse, req.body);
      const updatedCourse = await Course.findOne(
        { id },
        { '_id': 0, 'materials.access': 0, 'materials.sections.lessons.comments': 0 }
      )
        .lean()
        .populate('ownerId', 'login -_id');
      return res.status(200).json(updatedCourse);
    } catch (e) {
      if (e.message === 'Wrong user') res.status(400).json({ message: 'Such user is not exist' });
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async deleteOne(req: Request, res: Response): Promise<Response<any>> {
    try {
      let course = await Course.findOneAndDelete({
        id: req.params.id,
        ownerId: req.user!._id,
      });
      if (!course) return res.status(404).json({ message: 'Course not exists' });
      await User.findByIdAndUpdate(req.user!._id, {
        $pull: { courses: course._id },
      });
      if (!course) return res.status(403).json({ message: 'Forbidden' });
      return res.status(200).json();
    } catch (e) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async getLesson(
    req: Request<{ id: string; lesson: string }, {}, {}, { section: number; lesson: number }>,
    res: Response
  ): Promise<Response<any>> {
    const { section: snum, lesson: lnum } = req.query;
    if (req.params.lesson !== 'showtopic') return res.status(404).json();
    try {
      const course: CourseSchemaType = await Course.findOne({ id: req.params.id })
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
        sectionName: course.materials.sections[`${snum - 1}` as any].title,
        lessonName:
          course.materials.sections[`${snum - 1}` as any].lessons[`${lnum - 1}` as any].name,
        comments:
          course.materials.sections[`${snum - 1}` as any].lessons[`${lnum - 1}` as any].comments,
      };

      return res.status(200).json(lesson);
    } catch (e) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }

  static async postComment(
    req: Request<
      { id: string; lesson: string },
      {},
      { comment: string },
      { section: number; lesson: number }
    >,
    res: Response
  ): Promise<Response<any>> {
    const { section: snum, lesson: lnum } = req.query;
    if (req.params.lesson !== 'showtopic') return res.status(403).json();

    const comment = new Comment({
      ownerId: req.user!._id,
      content: req.body.comment,
    });

    try {
      const course = await Course.findOne({ id: req.params.id });
      if (!course) return res.status(400).json('Course not exists');
      const { comments } = course.materials.sections[`${snum - 1}` as any].lessons[
        `${lnum - 1}` as any
      ];

      comments.push(comment._id);
      await comment.save();
      await course.save();
      return res.status(200).json();
    } catch (e) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }
}
