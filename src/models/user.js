import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: { type: String, default: '' },
  courses: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    default: [],
  },
});

UserSchema.methods.updateCourse = async function (editingCourse, body) {
  delete body.id;
  delete body.ownerId;
  body.instructor?.names ? (editingCourse.instructor.names = body.instructor.names) : null;
  body.instructor?.jobs ? (editingCourse.instructor.jobs = body.instructor.jobs) : null;
  if (body.private && body.accessedUser) {
    const candidate = await mongoose.model('User').findOne({ login: body.accessedUser });
    if (!candidate) throw new Error('Wrong user');
    editingCourse.materials.access.users.push(candidate._id);
  }
  if (body.private) {
    editingCourse.materials.access.private = true;
  }

  return editingCourse.save();
};

export default mongoose.model('User', UserSchema);
