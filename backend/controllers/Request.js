import Request from "../models/Request.js";
import User from "../models/User.js";
import Interact from "../models/Interact.js";
import mongoose from "mongoose";
import { io, userSocketMap } from "../server.js";
export const allRequest = async (req, res) => {
  try {
    const request = await Request.find({
      $or: [
        { sender_id: req.user.id, status: "pending" },
        { receiver_id: req.user.id, status: "pending" },
      ],
    })
      .populate("sender_id receiver_id", "name")
      .lean();
    console.log("Fetched user request");
    return res.status(200).json({ message: "Fetched request", data: request });
  } catch (error) {
    await session.abortTransaction();
    console.log("Error from allRequest controller : ", error);
    return res.status(500).json("Internal Server Error");
  }
};
export const acceptRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const requestExist = await Request.findOne({
      _id: req.params.id,
      receiver_id: req.user.id,
      status: "pending",
    })
      .populate("receiver_id", "name")
      .session(session);
    if (!requestExist) {
      await session.abortTransaction();
      console.log("No such request Exist");
      return res.status(404).json({ message: "No such request Exist" });
    }
    await User.findByIdAndUpdate(
      requestExist.sender_id,
      {
        $addToSet: { following: requestExist.receiver_id },
      },
      { returnDocument: "after", session },
    );
    await User.findByIdAndUpdate(
      requestExist.receiver_id,
      {
        $addToSet: { followers: requestExist.sender_id },
      },
      { returnDocument: "after", session },
    );
    await Interact.create(
      [
        {
          follower_id: requestExist.sender_id,
          following_id: requestExist.receiver_id,
        },
      ],
      { session },
    );
    requestExist.status = "accepted";
    await requestExist.save({ session });
    await session.commitTransaction();
    const senderSocketId = userSocketMap[requestExist.sender_id];
    if (senderSocketId) {
      io.to(senderSocketId).emit("newContact", {
        id: requestExist._id,
        receiver_id: requestExist.receiver_id._id,
        by: requestExist.receiver_id.name,
      });
    }
    console.log("Successfully Accepted Request.");
    return res.status(201).json({
      message: "Successfully Accepted Request.",
      data: { id: requestExist._id, sender_id: requestExist.sender_id },
    });
  } catch (error) {
    await session.abortTransaction();
    console.log("Error from acceptRequest controller : ", error);
    return res.status(500).json("Internal Server Error");
  } finally {
    await session.endSession();
  }
};
export const rejectRequest = async (req, res) => {
  try {
    const requestExist = await Request.findOne({
      _id: req.params.id,
      receiver_id: req.user.id,
      status: "pending",
    }).populate("receiver_id", "name");
    if (!requestExist) {
      console.log("No such request Exist");
      return res.status(404).json({ message: "No such request Exist" });
    }
    requestExist.status = "rejected";
    await requestExist.save();
    const senderSocketId = userSocketMap[requestExist.sender_id];
    if (senderSocketId) {
      io.to(senderSocketId).emit("rejectRequest", {
        id: requestExist._id,
        by: requestExist.receiver_id.name,
      });
    }
    console.log("Successfully Rejected Request.");
    return res.status(200).json({
      message: "Successfully Rejected Request.",
      data: { id: requestExist._id },
    });
  } catch (error) {
    console.log("Error from rejectRequest controller : ", error);
    return res.status(500).json("Internal Server Error");
  }
};
