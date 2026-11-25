
import express from "express";

// Controllers
import {
  createQuestionController,
  getQuestionsController,
  getSingleQuestionController
} from "../controller/question.controller.js";

// Validations
import {
  createQuestionValidation,
  getQuestionsValidation,
  getSingleQuestionValidation
} from "../validations/question.validation.js";

// Middleware
import { authenticateUser } from "../../../middleware/authentication.js";

const router = express.Router();
router.post(
  "/",
  authenticateUser,
  createQuestionValidation,
  createQuestionController,
);

router.get(
  "/",
  authenticateUser,
  getQuestionsValidation,
  getQuestionsController,
);

router.get(
  "/:questionHash",
  authenticateUser,
  getSingleQuestionValidation,
  getSingleQuestionController,
);
router.post(
  "/draft-coach",
  authenticateUser,
  generateQuestionDraftCoachValidation,
  generateQuestionDraftCoachController,
);

router.post(
  "/:questionHash/answer-fit",
  authenticateUser,
  assessAnswerAgainstQuestionValidation,
  assessAnswerAgainstQuestionController,
);

export default router;
