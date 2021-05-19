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

UserSchema.methods.updateCourse = function (editingCourse, body) {
  delete body.id;
  delete body.ownerId;
  editingCourse.instructor.names = body.instructor.names;
  editingCourse.instructor.jobs = body.instructor.jobs;
  return editingCourse.save();
};

export default mongoose.model('User', UserSchema);
