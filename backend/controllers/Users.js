import User from "../models/User.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.user.id,
      },
    })
      .select("__id name")
      .lean();
    console.log("Got all Users");
    return res.status(200).json({ message: "Got all Users", data: users });
  } catch (error) {
    console.error("Error from getAllUsers Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getRelativeUsers = async (req, res) => {
  try {
    const getUsers = await User.find({
      _id: { $ne: req.user.id }, 
      $or: [
        { _id: { $in: req.user.following } }, 
        { _id: { $in: req.user.followers } }, 
      ],
    })
      .select("name pic _id banner lastOnline")
      .lean();

    const unSeenMessages = {};
    const lastMessages = {};
    const promises = getUsers.map(async (user) => {
      const senderId = new mongoose.Types.ObjectId(user._id);
      const receiverId = new mongoose.Types.ObjectId(req.user.id);
      const messages = await Message.aggregate([
        {
          $match: {
            $or: [
              // Using the casted ObjectIds here
              { sender_id: senderId, receiver_id: receiverId },
              { sender_id: receiverId, receiver_id: senderId },
            ],
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: null,
            unreadMessages: {
              $push: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$sender_id", senderId] }, // Match casted ID
                      { $eq: ["$seen", false] },
                    ],
                  },
                  "$$ROOT",
                  "$$REMOVE",
                ],
              },
            },
            lastMessage: { $first: "$$ROOT" },
          },
        },
      ]);
      const data = messages[0] || { unreadMessages: [], lastMessage: null };
      if (data.unreadMessages.length > 0) {
        unSeenMessages[user._id] = data.unreadMessages.length;
      }
      lastMessages[user._id] = data.lastMessage;
    });
    await Promise.all(promises);
    console.log("Successfully got relative user and their unseen messages");
    return res.status(200).json({
      message: "Successfully got relative user and their unseen messages",
      data: { user: getUsers, unseen: unSeenMessages, lastMessages },
    });
  } catch (error) {
    console.error("Error from getRelativeUsers Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
