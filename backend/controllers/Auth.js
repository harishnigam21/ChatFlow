import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { envList } from "../envConfig.js";
export const SignIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email })
      .select("+password +_id")
      .lean();
    if (!userExist) {
      console.warn("You haven't registered yet");
      return res.status(404).json({ message: "You haven't registered yet" });
    }
    const comparePassword = await bcrypt.compare(password, userExist.password);
    if (!comparePassword) {
      console.warn("Incorrect Password");
      return res.status(401).json({ message: "Incorrect Password" });
    }
    const access_token = jwt.sign(
      { id: userExist._id },
      envList.ACCESS_TOKEN_KEY,
      { expiresIn: "1d" },
    );
    const refresh_token = jwt.sign(
      { id: userExist._id },
      envList.REFRESH_TOKEN_KEY,
      { expiresIn: "7d" },
    );
    const updateRefreshToken = await User.findByIdAndUpdate(
      userExist._id,
      {
        $set: { refreshToken: refresh_token },
      },
      { returnDocument: "after", runValidators: true },
    )
      .select("-createdAt -updatedAt -__v")
      .lean();
    res.cookie("jwt", refresh_token, {
      secure: envList.SECURE || true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    console.log("Successfully Verified user");
    return res.status(200).json({
      message: "Successfully Verified user",
      data: updateRefreshToken,
      actk: access_token,
    });
  } catch (error) {
    console.error("Error from SignIn controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const SignUp = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      console.warn("User already exists");
      return res.status(409).json({ message: "User already exists" });
    }
    const encryptedPassword = await bcrypt.hash(password, 5);
    await User.create({
      name,
      email,
      password: encryptedPassword,
    });
    console.log("Successfully User Created");
    return res.status(201).json({ message: "Successfully User Created" });
  } catch (error) {
    console.error("Error from SignUp controller : ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const handleRefresh = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt)
      return res.status(401).json({ message: "Cookie missing" });
    const findUser = await User.findOne({ refreshToken: cookies.jwt })
      .select("+refreshToken +_id")
      .lean();
    if (!findUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: envList.SECURE || true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(403).json({ message: "Invalid payload" });
    }
    const { refreshToken, createdAt, updatedAt, __v, ...other } = findUser;
    jwt.verify(
      findUser.refreshToken,
      envList.REFRESH_TOKEN_KEY,
      (err, decoded) => {
        if (err || findUser._id != decoded.id)
          return res.status(403).json({ status: false });
        const access_token = jwt.sign(
          { id: decoded.id },
          process.env.ACCESS_TOKEN_KEY,
          { expiresIn: "1d" },
        );
        return res.status(200).json({ actk: access_token, data: other });
      },
    );
  } catch (error) {
    console.error("Error from handleRefresh controller : ", error);
    return res.status(500).json("Internal Server Error");
  }
};

export const SignOut = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt)
      return res.status(401).json({ message: "Cookie missing" });
    const findUser = await User.findOne({ refreshToken: cookies.jwt })
      .select("+refreshToken +_id")
      .lean();
    if (!findUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: envList.SECURE || true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      }); //TODO:Add secure:true at production side
      return res.status(200).json({ status: true });
    }
    await User.findOneAndUpdate(
      {
        refreshToken: findUser.refreshToken,
      },
      { $set: { refreshToken: "" } },
    );
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: envList.SECURE || true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    }); //TODO:Add secure:true at production side
    return res.status(200).json({ status: true });
  } catch (error) {
    console.error("Error from logOut controller : ", error);
    return res.status(500).json({ message: error.message });
  }
};
