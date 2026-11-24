import express from "express";

// Controllers
import {
  getQuestionsController
} from "../controller/question.controller.js";

// Validations
import {
  getQuestionsValidation
} from "../validations/question.validation.js";

// Middleware
import { authenticateUser } from "../../../middleware/authentication.js";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  getQuestionsValidation,
  getQuestionsController,
);

export default router;