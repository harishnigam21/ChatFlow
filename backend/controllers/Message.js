import mongoose from "mongoose";
import Message from "../models/Message.js";
import cloudinary from "../utils/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { envList } from "../envConfig.js";

export const getRelativeMessages = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            {
              sender_id: new mongoose.Types.ObjectId(req.params.id),
              receiver_id: new mongoose.Types.ObjectId(req.user.id),
            },
            {
              sender_id: new mongoose.Types.ObjectId(req.user.id),
              receiver_id: new mongoose.Types.ObjectId(req.params.id),
            },
          ],
        },
      },
      {
        $match: {
          deletedFor: { $nin: [new mongoose.Types.ObjectId(req.user.id)] },
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $addFields: {
          message: {
            $cond: [
              { $eq: ["$deletedForEveryone", true] },
              "$$REMOVE",
              "$message",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            sortDate: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            day: { $dateToString: { format: "%d/%m/%Y", date: "$createdAt" } },
            year: { $dateToString: { format: "%Y", date: "$createdAt" } },
          },
          messages: { $push: "$$ROOT" }, // Collect messages for that day
        },
      },
      {
        $group: {
          _id: "$_id.year",
          days: {
            $push: {
              k: "$_id.day",
              v: "$messages",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          data: { $arrayToObject: "$days" },
        },
      },
      { $sort: { year: 1 } },
    ]).session(session);
    // Transform the array [ {year: '2024', data: {...}} ] into one big object
    const formattedData = messages.reduce((acc, curr) => {
      acc[curr.year] = curr.data;
      return acc;
    }, {});

    await Message.updateMany(
      { sender_id: req.params.id, receiver_id: req.user.id },
      { seen: true },
      { session },
    );
    await session.commitTransaction();
    const senderSocketId = userSocketMap[req.params.id];
    if (senderSocketId) {
      io.to(senderSocketId).emit("allMessageSeen", req.user.id);
    }
    console.log("Successfully got relative messages");
    return res.status(200).json({
      message: "Successfully got relative messages",
      data: formattedData,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error from getRelativeMessages Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await session.endSession();
  }
};

export const sendMessage = async (req, res) => {
  const { image, message } = req.body;
  try {
    if (
      !req.user.following.includes(req.params.id) &&
      !req.user.followers.includes(req.params.id)
    ) {
      console.log("Person you are trying to chat is not in your connection");
      return res.status(403).json({
        message: "Person you are trying to chat is not in your connection",
      });
    }
    let imageUrl = null;
    let thumbnail = null;
    if (image) {
      const upload = await cloudinary.uploader.upload(image, {
        folder: `${envList.ROOT}/user/chat/${req.user.id}/messages/${req.params.id}/image`,
      });
      imageUrl = upload.secure_url;
      thumbnail = upload.secure_url.replace(
        "/upload/",
        "/upload/e_blur:1000,q_10,w_200/",
      );
    }
    const newMessage = await Message.create({
      sender_id: req.user.id,
      receiver_id: req.params.id,
      message: message || "",
      image: imageUrl,
      thumbnail: thumbnail,
    });

    const receiverSocketId = userSocketMap[req.params.id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    console.log("Successfully sended message");
    return res
      .status(201)
      .json({ message: "Successfully sended message", data: newMessage });
  } catch (error) {
    console.error("Error from sendMessage Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markSeen = async (req, res) => {
  try {
    const updatedMessage = await Message.findOneAndUpdate(
      { _id: req.params.id, receiver_id: req.user.id },
      { $set: { seen: true } },
      { returnDocument: "after", runValidators: true },
    );
    if (!updatedMessage) {
      return res.status(404).json({ message: "message not found!" });
    }
    const senderSocketId = userSocketMap[updatedMessage.sender_id];
    if (senderSocketId) {
      const id = updatedMessage._id.toString();
      io.to(senderSocketId).emit("someMessageSeen", id);
    }
    console.log("unseen ----> seen");
    return res.status(200).json({ message: "unseen ----> seen" });
  } catch (error) {
    console.error("Error from markSeen Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessages = async (req, res) => {
  const { messageIds } = req.body;
  if (!messageIds || messageIds.length == 0) {
    return res.status(400).json({ message: "No message IDs provided" });
  }
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const receiverId = new mongoose.Types.ObjectId(req.params.id);
    const { messageIds } = req.body;

    const messages = await Message.find({
      _id: { $in: messageIds },
    });

    if (!messages.length) {
      return res.status(404).json({
        success: false,
        message: "No messages found",
      });
    }

    const bulkOps = [];
    const senderUpdatedIds = [];
    const receiverUpdatedIds = [];
    const deletedForEveryoneIds = [];

    messages.forEach((msg) => {
      const isSender = msg.sender_id.toString() === userId.toString();
      const isReceiver = msg.receiver_id.toString() === userId.toString();

      if (isSender) {
        senderUpdatedIds.push(msg._id);

        if (!msg.seen && !msg.deletedForEveryone) {
          deletedForEveryoneIds.push(msg._id);

          bulkOps.push({
            updateOne: {
              filter: { _id: msg._id },
              update: {
                $set: { deletedForEveryone: true },
              },
            },
          });
        } else {
          bulkOps.push({
            updateOne: {
              filter: { _id: msg._id },
              update: {
                $addToSet: { deletedFor: userId },
              },
            },
          });
        }
      } else if (isReceiver) {
        receiverUpdatedIds.push(msg._id);

        bulkOps.push({
          updateOne: {
            filter: { _id: msg._id },
            update: {
              $addToSet: { deletedFor: userId },
            },
          },
        });
      }
    });

    if (bulkOps.length > 0) {
      await Message.bulkWrite(bulkOps);
    }

    // Latest message
    const senderRecentDoc = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
      deletedFor: { $nin: [userId] },
    })
      .sort({ createdAt: -1 })
      .limit(1);
    const receiverRecentDoc = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: receiverId },
        { sender_id: receiverId, receiver_id: userId },
      ],
      deletedFor: { $nin: [receiverId] },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    const senderLatestMessage = senderRecentDoc[0] || null;
    const receiverLatestMessage = receiverRecentDoc[0] || null;
    const deletedForEveryoneCount = deletedForEveryoneIds.length;

    const receiverSocketId = userSocketMap[req.params.id];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", {
        id: req.user.id,
        updateLast: receiverLatestMessage,
        count: deletedForEveryoneCount,
      });
    }

    return res.status(200).json({
      success: true,
      updateLast: senderLatestMessage,
      senderUpdatedIds,
      receiverUpdatedIds,
      deletedForEveryoneIds,
    });
  } catch (error) {
    console.error("Error from deleteMessages Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
