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
    } else {
      const existingDevice = user.devices.find(
        (device) => device.deviceId === deviceId
      );

      if (existingDevice && existingDevice.isActive === false) {
        return res.status(400).json({
          success: false,
          errorCode: 400,
          message: "You have been logged out from another device",
        });
      } else {
        const activeDevices = user.devices.filter((d) => d.isActive);

        if (activeDevices.length >= 3) {
          return res.status(403).json({
            success: false,
            errorCode: 403,
            message:
              "Maximum 3 devices allowed. Please logout from another device.",
            user: {
              userId: user.userId,
              devices: user.devices.map((device) => ({
                deviceId: device.deviceId,
                deviceName: device.deviceName,
                isActive: device.isActive,
                createdAt: device.createdAt,
              })),
            },
          });
        }

        user.devices.push({
          deviceId,
          deviceName: deviceName || "Unknown Device",
          isActive: true,
          createdAt: new Date(),
        });
      }

      await user.save();
    }

    res.json({
      success: true,
      message: "User fetched successfully",
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        devices: user.devices.map((device) => ({
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          isActive: device.isActive,
          createdAt: device.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("User error:", error);
    res.status(500).json({
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

    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
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
    }

    await user.save();

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
