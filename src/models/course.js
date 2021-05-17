import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String },
  videoLength: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lessons: [
    {
      title: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      video: { type: String, required: true },
      comments: [
        {
          authorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
          commentId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Comment' },
        },
      ],
    },
  ],
});

export default mongoose.model('Course', CourseSchema);
