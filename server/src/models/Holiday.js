import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  country: String,
  date: String,
  localName: String,
  name: String
});

export default mongoose.model("Holiday", holidaySchema);
