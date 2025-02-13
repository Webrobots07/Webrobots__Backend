// import mongoose from 'mongoose';

// const cvSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   mobile: String,
//   education: String,
//   work_experience: String,
//  cvFile: {          // Store CV as binary data
//     data: Buffer,
//     contentType: String
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model('CV', cvSchema);


import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  education: String,
  work_experience: String,
  cvFileUrl: String, // Store Cloudinary URL instead of binary data
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CV', cvSchema);
