import mongoose, { Schema, Document } from 'mongoose';

export type CommentSchemaType = {
  _id: string;
  ownerId: string;
  content: string;
  date: Date;
};

export interface ICommentChema extends Omit<CommentSchemaType, '_id'>, Document {}

const CommentSchema: Schema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.model<ICommentChema>('Comment', CommentSchema);
