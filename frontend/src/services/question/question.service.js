async generateQuestionDraftCoach(payload) {
    const response = await apiClient.post('/api/questions/draft-coach', payload);
    return response.data;
},
async assessAnswerFit(questionHash, answerText) {
    const response = await apiClient.post(
    `/api/questions/${questionHash}/answer-fit`,
    { answerText },
    );
    return response.data;
},