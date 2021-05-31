import type { Request, Response, NextFunction } from 'express';
import Course from '../models/course';

export default async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any> | void> => {
  if (req.method === 'OPTIONS') return next();

  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course?.materials.access.private) return next();

    if (
      course.materials.access.users.includes(req.user!._id) ||
      course.ownerId.toString() === req.user!._id.toString()
    ) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (e) {
    return res.status(500).json({ message: 'Server Error' });
  }
};
