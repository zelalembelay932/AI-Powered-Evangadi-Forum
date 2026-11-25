export const generateQuestionDraftCoachValidation = [
  body('title')
    .optional()
    .isString()
    .withMessage('Question title must be a string')
    .isLength({ max: 255 })
    .withMessage('Question title must not exceed 255 characters')
    .trim(),
  body('content')
    .notEmpty()
    .withMessage('Question content is required')
    .isString()
    .withMessage('Question content must be a string')
    .isLength({ min: 10 })
    .withMessage('Question content must be at least 10 characters')
    .trim(),
  validationErrorHandler,
];

export const assessAnswerAgainstQuestionValidation = [
  param('questionHash')
    .isString()
    .withMessage('Question hash is required')
    .matches(/^[a-f0-9]{16}$/)
    .withMessage('Question hash must be a 16-character lowercase hex string'),
  body('answerText')
    .notEmpty()
    .withMessage('Answer text is required')
    .isString()
    .withMessage('Answer text must be a string')
    .isLength({ min: 20 })
    .withMessage('Answer text must be at least 20 characters for a meaningful fit check')
    .trim(),
  validationErrorHandler,
];