import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth";
import formRoutes from "./routes/forms";
import userRoutes from "./routes/users";
import assignedRoutes from "./routes/assigned";
import responsesRoutes from "./routes/responses";
import { verifyToken } from "./middleware/auth";

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/auth", authRoutes);

const router = express.Router();
router.use("/forms", formRoutes);
router.use("/users", userRoutes);
router.use("/assigned", assignedRoutes);
router.use("/responses", responsesRoutes);
app.use("/api", verifyToken, router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
