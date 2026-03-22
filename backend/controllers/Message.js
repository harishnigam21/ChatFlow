import mongoose from "mongoose";
import Message from "../models/Message.js";
import cloudinary from "../utils/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { envList } from "../envConfig.js";

export const getRelativeMessages = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // const messages = await Message.find(
    //   {
    //     $or: [
    //       {
    //         sender_id: req.params.id,
    //         receiver_id: req.user.id,
    //       },
    //       {
    //         sender_id: req.user.id,
    //         receiver_id: req.params.id,
    //       },
    //     ],
    //   },
    //   null,
    //   { session },
    // ).lean();

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
      { $sort: { createdAt: 1 } },
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
      "/upload/e_blur:1000,q_10,w_200/"
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
