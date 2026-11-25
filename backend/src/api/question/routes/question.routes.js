router.post(
  '/draft-coach',
  authenticateUser,
  generateQuestionDraftCoachValidation,
  generateQuestionDraftCoachController,
);


router.post(
  '/:questionHash/answer-fit',
  authenticateUser,
  assessAnswerAgainstQuestionValidation,
  assessAnswerAgainstQuestionController,
);
import express from "express";

// Controllers
import {
  getQuestionsController,
  getSingleQuestionController
} from "../controller/question.controller.js";

// Validations
import {
  getQuestionsValidation,
  getSingleQuestionValidation
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

router.get(
  "/:questionHash",
  authenticateUser,
  getSingleQuestionValidation,
  getSingleQuestionController,
);

export default router;
