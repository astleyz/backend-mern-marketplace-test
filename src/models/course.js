import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
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
            comments: [
              {
                authorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
                commentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Comment' },
              },
            ],
          },
        ],
      },
    ],
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

export default mongoose.model('Course', CourseSchema);
