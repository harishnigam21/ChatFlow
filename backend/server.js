import express from "express";
import http from "http";
import cors from "cors";
import connectDB from "./DB/DBConnection.js";
import Auth from "./routes/Auth.js";
import Message from "./routes/Message.js";
import corsOptions from "./config/cors.js";
import { envList } from "./envConfig.js";
import { Server } from "socket.io";
import credentials from "./middlewares/credentials/credentials.js";
import cookieParser from "cookie-parser";
import User from "./models/User.js";
connectDB();
const app = express();
const server = http.createServer(app);
const PORT = envList.PORT || 5005;

//socket setup
export const io = new Server(server, {
  cors: { origin: "*" },
});
//currently Online Users
export const userSocketMap = {};
//socket connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  //emit online user to all connected users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  //on disconnect
  socket.on("disconnect", () => {
    const captureLast = async () => {
      const newDate = new Date();
      await User.findByIdAndUpdate(userId, { $set: { lastOnline: newDate } });
    };
    captureLast();
    console.log("User DisConnected", userId);
    io.emit("getOfflineUser", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//middleware's
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
//routes
app.use("/api/auth", Auth);
app.use("/api/message", Message);

app.get("/", (req, res) =>
  res.status(200).json({ message: "Backend Server running successfully" }),
);
server.listen(PORT, () =>
  console.log(`Backend Server is running at PORT No.-->> ${PORT}`),
);
export default server;
