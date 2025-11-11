import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";

export const getUser = async (req, res) => {
  try {
    const { email, deviceId, deviceName } = req.query;

    if (!email || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Email and deviceId are required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        userId: uuidv4(),
        email,
        name: null,
        phoneNumber: null,
        devices: [
          {
            deviceId,
            deviceName: deviceName || "Unknown Device",
            isActive: true,
            createdAt: new Date(),
          },
        ],
      });

      return res.json({
        success: true,
        message: "New user created successfully",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          devices: user.devices,
        },
      });
    }

    const existingDevice = user.devices.find((d) => d.deviceId === deviceId);

    if (existingDevice && existingDevice.isActive === false) {
      user.devices = user.devices.filter((d) => d.deviceId !== deviceId);
      await user.save();
      return res.status(400).json({
        success: false,
        errorCode: 400,
        message: "You have been logged out from another device",
      });
    }

    const activeDevices = user.devices.filter((d) => d.isActive);

    if (activeDevices.length >= 3 && !existingDevice) {
      const oldestDevice = activeDevices.reduce((oldest, current) =>
        oldest.createdAt < current.createdAt ? oldest : current
      );

      const deviceToLogout = user.devices.find(
        (d) => d.deviceId === oldestDevice.deviceId
      );
      if (deviceToLogout) {
        deviceToLogout.isActive = false;
        deviceToLogout.loggedOutReason = "Exceeded device limit";
        deviceToLogout.updatedAt = new Date();
      }

      user.devices.push({
        deviceId,
        deviceName: deviceName || "Unknown Device",
        isActive: true,
        createdAt: new Date(),
      });

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Oldest device logged out. New device logged in successfully.",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          phoneNumber: user.phoneNumber,
          devices: user.devices,
        },
      });
    }

    if (!existingDevice) {
      user.devices.push({
        deviceId,
        deviceName: deviceName || "Unknown Device",
        isActive: true,
        createdAt: new Date(),
      });
    } else {
      existingDevice.isActive = true;
      existingDevice.deviceName = deviceName || existingDevice.deviceName;
      existingDevice.updatedAt = new Date();
    }

    await user.save();

    return res.json({
      success: true,
      message: "User fetched successfully",
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        devices: user.devices,
      },
    });
  } catch (error) {
    console.error("User error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId, name, phoneNumber } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();

    return res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { userId, deviceId } = req.body;

    if (!userId || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "UserId and deviceId are required",
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const device = user.devices.find((d) => d.deviceId === deviceId);
    if (device) {
      device.isActive = false;
      device.loggedOutReason = "User initiated logout";
      device.updatedAt = new Date();
    }

    await user.save();

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
