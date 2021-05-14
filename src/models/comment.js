// import { Schema, model } from 'mongoose';

// const comment = new Schema({
//   author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
//   content: { type: String, required: true },
//   date: { type: Date, required: true, default: Date.now },
// });

// export default model('Comment', comment);

import mongoose from 'mongoose';

const comment = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

export default mongoose.model('Comment', comment);
