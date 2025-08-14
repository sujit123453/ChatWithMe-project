import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

//create Express app adn HTTP server
const app = express();
const server = http.createServer(app);

//Initialize socket.io server
const FRONTEND_URL = "https://chat-with-me-project-theta.vercel.app";

export const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

//store online users
export const userSocketMap = {}; //{userId:socketId}

//Socket.io connection hadler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);
  if (userId) userSocketMap[userId] = socket.id;

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

//Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(
  cors({
    origin: "https://chat-with-me-project-tau.vercel.app", // your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // if you use cookies or authentication headers
  })
);

//Routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//connect to mongodb
await connectDB();

if (process.env.NODE_ENV != "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log("Server running at PORT:" + PORT));
}

//export server for vercel
export default server;
