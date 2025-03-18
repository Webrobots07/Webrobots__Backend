import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  query: {
    type: String,
  },
  queryType: {
    type: String,
  },
  summary: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Summary = mongoose.model("Summary", summarySchema);
export default Summary;
