import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import apiRoutes from "./routes/api.routes.js";
import { errorMiddleware, notFound } from "./middlewares/error.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" },
});
app.set("io", io);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, product: "Elara" }));
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorMiddleware);

io.on("connection", (socket) => {
  socket.on("queue:join", () => socket.join("queue"));
});

const port = Number(process.env.PORT || 5000);

connectDb(process.env.MONGO_URI)
  .then(() => {
    server.listen(port, () => console.log(`Elara API on :${port}`));
  })
  .catch((err) => {
    console.error("Mongo connection failed", err);
    process.exit(1);
  });
