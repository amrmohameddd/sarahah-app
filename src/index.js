
import express from "express";
import "dotenv/config";

import dbConnection from "./DB/db.conection.js";

import userRoutes from "./Modules/User/user.routes.js";
import messageRoutes from "./Modules/Message/message.routes.js";
import authRoutes from "./Modules/Auth/auth.routes.js";
import conversationRoutes from "./Modules/Conversation/conversation.routes.js";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Sarahah API is running" });
});

const startServer = async () => {
  await dbConnection();

  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
};

startServer();
