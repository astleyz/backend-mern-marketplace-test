import mongoose, { Schema, Document } from 'mongoose';

export type TokenSchemaType = {
  _id: string;
  token: string;
  userId: string;
  date: Date;
};

export interface ITokenSchema extends Omit<TokenSchemaType, '_id'>, Document {}

const TokenSchema: Schema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.model<ITokenSchema>('Token', TokenSchema);
