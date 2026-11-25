import { StatusCodes } from "http-status-codes";
import {
  getQuestionsService,
  getSingleQuestionService,
} from "../service/question.service.js";





export const createQuestionController = async (req, res, next) => {
  // An Express handler that can await asynchronous service/database work.
  // req  =>	Information coming from the client
  // res =>	How to send the response
  // next =>	How to continue middleware processing or handle errors
  try {
    const { title, content } = req.body;
    // Destructures the JSON request body fields
    const result = await createQuestionWithVectorService({
      // This calls the function you imported from question.service.js.
      // Its job is to create a question and generate the vector embedding.
      userId: req.user.id, // author id (authenticated user)
      // our backend authentication middleware verifies the JWT token and attaches the decoded user's information
      title,
      content,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Question posted successfully.",
      data: result.question,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuestionsController = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      mine: req.query.mine,
      userId: req.user.id, // Pass the authenticated user's ID
    };

    const result = await getQuestionsService(filters);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions fetched successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles AI relevance assessment of an answer draft against a question.
 */
export const assessAnswerAgainstQuestionController = async (req, res, next) => {
  try {
    const { questionHash } = req.params;
    const { answerText } = req.body;
    const { question } = await getSingleQuestionService({ questionHash });
    const data = await assessAnswerAgainstQuestionService({
      questionTitle: question.title,
      questionContent: question.content,
      answerText,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Answer fit assessed.',
      data,
    });
  } catch (error) {
    next(error);
  }
}