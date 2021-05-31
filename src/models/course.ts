import mongoose, { Schema, Document } from 'mongoose';

export type CourseSchemaType = {
  _id: string;
  id: string;
  title: string;
  subTitle: string;
  img: string;
  authors: string;
  authorNames: string[];
  whatWillYouLearn: {
    title: string;
    items: string[];
  };
  requirements: {
    title: string;
    items: string[];
  };
  description: {
    title: string;
    html: string;
  };
  forWho: {
    title: string;
    items: string[];
  };
  materials: MaterialType;
  instructor: {
    title: string;
    names: string[];
    jobs: string[];
    coursesQuantity: string;
    aboutme: string;
  };
  ownerId: string;
};

export type MaterialType = {
  title: string;
  info: string;
  sections: SectionType[];
  access: {
    private: boolean;
    users: string[];
  };
};

export type SectionType = {
  title: string;
  fullLength: string;
  lessons: LessonType[];
};

export type LessonType = {
  name: string;
  length: string;
  comments: string[];
};

export interface ICourseSchema extends Omit<CourseSchemaType, '_id' | 'id'>, Document {}

const CourseSchema: Schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subTitle: { type: String, required: true },
  img: { type: String, required: true },
  authors: { type: String, required: true },
  authorNames: [String],
  whatWillYouLearn: {
    title: { type: String, required: true },
    items: [String],
  },
  requirements: {
    title: { type: String, required: true },
    items: [String],
  },
  description: {
    title: { type: String, required: true },
    html: String,
  },
  forWho: {
    title: { type: String, required: true },
    items: [String],
  },
  materials: {
    title: { type: String, required: true },
    info: { type: String, required: true },
    sections: [
      {
        title: { type: String, required: true },
        fullLength: { type: String, required: true },
        lessons: [
          {
            name: String,
            length: String,
            comments: {
              type: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Comment' }],
              default: [],
            },
          },
        ],
      },
    ],
    access: {
      private: { type: Boolean, default: false },
      users: [{ type: mongoose.Schema.Types.ObjectId, unique: true, ref: 'User' }],
    },
  },
  instructor: {
    title: { type: String, required: true },
    names: [{ type: String, required: true }],
    jobs: [String],
    coursesQuantity: String,
    aboutme: String,
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<ICourseSchema>('Course', CourseSchema);
