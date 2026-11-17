import express from "express";
import {
  registerController,
  loginController,
} from "../controller/auth.controller.js";
import {
  registerValidation,

} from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", registerValidation, registerController);




export default router;
