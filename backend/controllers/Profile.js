import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../utils/cloudinary.js";
import { envList } from "../envConfig.js";
export const updateProfile = async (req, res) => {
  const { name, bio, pic, banner } = req.body;
  try {
    const toUpdate = {};
    if (name) {
      toUpdate["name"] = name;
    }
    if (bio) {
      toUpdate["bio"] = bio;
    } //TODO:What if the data of image is sended is not in base64 format
    if (pic) {
      const upload = await cloudinary.uploader.upload(pic, {
        folder: `${envList.ROOT}/profile/${req.user.id}/pic`,
      });
      const imageUrl = upload.secure_url;
      toUpdate["pic"] = imageUrl;
    }
    if (banner) {
      const upload = await cloudinary.uploader.upload(banner, {
        folder: `${envList.ROOT}/profile/${req.user.id}/banner`,
      });
      const imageUrl = upload.secure_url;
      toUpdate["banner"] = imageUrl;
    }
    if (Object.keys(toUpdate).length <= 0) {
      return res.status(304).json({ message: "Nothing to update" });
    }
    const update = await User.findByIdAndUpdate(
      req.user.id,
      { $set: toUpdate },
      { returnDocument: "after", runValidators: true },
    )
      .select("-createdAt -updatedAt -__v")
      .lean();
    console.log("Successfully Updated Profile");
    return res
      .status(200)
      .json({ message: "Successfully Updated Profile", data: update });
  } catch (error) {
    console.error("Error from updateProfile Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const profileMedia = async (req, res) => {
  try {
    const media = await Message.find(
      {
        $or: [
          {
            sender_id: req.params.id,
            receiver_id: req.user.id,
            media: { $exists: true, $ne: null },
            deletedFor: { $nin: req.user.id },
            deletedForEveryone: false,
          },
          {
            sender_id: req.user.id,
            receiver_id: req.params.id,
            media: { $exists: true, $ne: null },
            deletedFor: { $nin: req.user.id },
            deletedForEveryone: false,
          },
        ],
      },
      null,
    )
      .select("media")
      .lean();
    let toSend = [];
    if (media.length > 0) {
      toSend = media
        .map((md) => md.media)
        .flat()
        .map((item) => ({
          thumbnail: item.thumbnail,
          url: item.url,
          type: item.type,
          name: item.name,
          size: item.size,
          _id: item._id,
        }));
    }
    console.log("Successfully got media");
    return res
      .status(200)
      .json({ message: "Successfully got media", data: toSend });
  } catch (error) {
    console.error("Error from profileMedia Controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
