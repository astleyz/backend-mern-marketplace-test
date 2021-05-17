import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.model('Token', TokenSchema);
