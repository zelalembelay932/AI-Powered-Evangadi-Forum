import express from "express";
import authRoutes from "./auth/routes/auth.routes.js";
const mainRouter = express.Router();

// Authentication routes
mainRouter.use("/auth", authRoutes);


export default mainRouter;
