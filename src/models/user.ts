import mongoose, { Schema, Document } from 'mongoose';
import type { ICourseSchema } from './course';
import type { PutchingCourseType } from '../interfaces';

export type UserSchemaType = {
  _id: string;
  login: string;
  password: string;
  img: string;
  courses: string[];
};

export interface IUserSchema extends Omit<UserSchemaType, '_id'>, Document {
  updateCourse: IUpdateCourse;
}

const UserSchema: Schema = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: { type: String, default: '' },
  courses: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    default: [],
  },
});

interface IUpdateCourse {
  (
    editingCourse: ICourseSchema,
    body: Omit<PutchingCourseType, 'id' | 'ownerId'> & { id?: string; ownerId?: string }
  ): Promise<unknown>;
}

UserSchema.methods.updateCourse = <IUpdateCourse>async function (editingCourse, body) {
  delete body.id;
  delete body.ownerId;
  body.instructor?.names ? (editingCourse.instructor.names = body.instructor.names) : null;
  body.instructor?.jobs ? (editingCourse.instructor.jobs = body.instructor.jobs) : null;
  if (body.private && body.accessedUser) {
    const candidate: IUserSchema | null = await (<any>(
      mongoose.model('User').findOne({ login: body.accessedUser })
    ));
    if (!candidate) throw new Error('Wrong user');
    editingCourse.materials.access.users.push(candidate._id);
  }
  if (body.private) {
    editingCourse.materials.access.private = true;
  }

  return editingCourse.save();
};

export default mongoose.model<IUserSchema>('User', UserSchema);
