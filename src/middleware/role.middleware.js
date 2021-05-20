import Course from '../models/course.js';

export default async (req, res, next) => {
  if (req.method === 'OPTIONS') next();

  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course.materials.access.private) return next();

    if (
      course.materials.access.users.includes(req.user._id) ||
      course.ownerId.toString() === req.user._id.toString()
    ) {
      return next();
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
};
