import mongoose from "mongoose";

const deviceSessionSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
  },
  deviceName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    devices: [deviceSessionSchema],
    maxDevices: {
      type: Number,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSessionSchema);
export default User;
