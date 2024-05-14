import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: { type: Date, expires: "60m", default: Date.now },
});

export const Otp = mongoose.model("Otp", otpSchema);
