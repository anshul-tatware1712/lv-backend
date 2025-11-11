import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  deviceName: { type: String, default: "Unknown Device" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  loggedOutReason: { type: String, default: null },
});

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: { type: String, default: null },
  phoneNumber: { type: String, default: null },
  devices: [deviceSchema],
});

export default mongoose.model("User", userSchema);
