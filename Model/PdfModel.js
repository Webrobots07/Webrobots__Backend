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


// import mongoose from 'mongoose';

// const cvSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   mobile: String,
//   education: String,
//   work_experience: String,
//   cvFileUrl: String, // Store Cloudinary URL instead of binary data
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model('CV', cvSchema);

import mongoose from "mongoose";

const workExperienceSchema = new mongoose.Schema({
  company_name: { type: String, default: null },
  position: { type: String, default: null },
  duration: { type: String, default: null },
  year: { type: String, default: null },
});

const cvSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  mobile: String,
  mtech_college_name: { type: String, default: null },
  mtech_year: { type: String, default: null },
  mtech_marks: { type: String, default: null },
  mtech_branch: { type: String, default: null },
  btech_college_name: { type: String },
  btech_year: { type: String},
  btech_marks: { type: String},
  btech_branch: { type: String},
  isc_name: { type: String },
  isc_marks: { type: String},
  isc_year: { type: String },
  matriculation_school_name: { type: String},
  matriculation_year: { type: String },
  matriculation_marks: { type: String},
  work_experience: [workExperienceSchema],
  cvFileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  summary:String
});

const CV = mongoose.model("CV", cvSchema);

export default CV;
