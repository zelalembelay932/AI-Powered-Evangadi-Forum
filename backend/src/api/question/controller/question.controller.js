/**
 * Handles AI coaching for a question draft (title + body).
 */
export const generateQuestionDraftCoachController = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const data = await generateQuestionDraftCoachService({ title, content });
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Draft suggestions generated.',
      data,
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