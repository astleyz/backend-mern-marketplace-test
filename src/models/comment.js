import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.model('Comment', CommentSchema);
