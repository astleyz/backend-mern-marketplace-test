// import { Schema, model } from 'mongoose';

// const course = new Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   img: String,
// });

// export default model('User', course);

import mongoose from 'mongoose';

const course = new mongoose.Schema({
  login: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: String,
});

export default mongoose.model('User', course);
