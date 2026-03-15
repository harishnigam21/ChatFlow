import Request from "../models/Request.js";
import User from "../models/User.js";
import Interact from "../models/Interact.js";
import mongoose from "mongoose";
import { io, userSocketMap } from "../server.js";
const type = "connection";
export const follow = async (req, res) => {
  try {
    const followingExist = await User.findById(req.params.id).lean();
    if (!followingExist) {
      console.log(`following person doesn't exist`);
      return res
        .status(404)
        .json({ message: `following person doesn't exist` });
    }
    const requestExist = await Request.findOne({
      type,
      status: { $ne: "rejected" },
      $or: [
        { sender_id: req.user.id, receiver_id: followingExist._id },
        { sender_id: followingExist._id, receiver_id: req.user.id },
      ],
    });
    if (requestExist) {
      return res.status(409).json({ message: "Request Exists on your Inbox" });
    }
    const request = await Request.create({
      sender_id: req.user.id,
      receiver_id: followingExist._id,
      type,
    });
    const deepRequest = await request.populate("sender_id receiver_id", "name");
    const followingSocketId = userSocketMap[followingExist._id];
    if (followingSocketId) {
      io.to(followingSocketId).emit("newRequest", deepRequest);
    }
    console.log("Successfully request created");
    return res
      .status(201)
      .json({ message: "Successfully request created", data: deepRequest });
  } catch (error) {
    console.log("Error from follow controller : ", error);
    return res.status(500).json("Internal Server Error");
  }
};
export const unfollow = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const followingExist = await User.findById(req.params.id)
      .session(session)
      .lean();
    if (!followingExist) {
      await session.abortTransaction();
      console.log(`following person doesn't exist`);
      return res
        .status(404)
        .json({ message: `following person doesn't exist` });
    }
    if (req.user.following.some((id) => id.toString() == req.params.id)) {
      await Interact.deleteOne(
        {
          follower_id: req.user.id,
          following_id: req.params.id,
        },
        { session },
      );
      //TODO:Currently deleted all previous follow request for this user
      await Request.deleteMany(
        {
          type,
          $or: [
            { sender_id: req.user.id, receiver_id: followingExist._id },
            { sender_id: followingExist._id, receiver_id: req.user.id },
          ],
        },
        { session },
      );
      await User.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { followers: req.user.id },
        },
        { session },
      );
      await User.findByIdAndUpdate(
        req.user.id,
        {
          $pull: { following: req.params.id },
        },
        { returnDocument: "after", session },
      );
      await session.commitTransaction();
      const followingSocketId = userSocketMap[req.params.id];
      if (followingSocketId) {
        io.to(followingSocketId).emit("unfollow", {
          id: req.user.id,
          by: req.user.name,
        });
      }
      console.log("Successfully unFollowed");
      return res.status(200).json({
        message: "Successfully unFollowed",
        data: req.params.id,
      });
    }
    await session.abortTransaction();
    console.log("You have not followed this person yet!");
    return res
      .status(406)
      .json({ message: "You have not followed this person yet!" });
  } catch (error) {
    await session.abortTransaction();
    console.log("Error from unfollow controller : ", error);
    return res.status(500).json("Internal Server Error");
  } finally {
    await session.endSession();
  }
};
