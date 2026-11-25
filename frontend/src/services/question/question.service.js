import { apiClient } from "../core/api.client.js";

export const questionService = {
  async getQuestions({ search, mine } = {}) {
    const response = await apiClient.get("/api/questions", {
      params: { search: search || undefined, mine: mine || undefined },
    });
    return response.data;
  },
  async getSingleQuestion(questionHash) {
    const response = await apiClient.get(`/api/questions/${questionHash}`);
    return response.data;
  },
  async createQuestion(payload) {
    const response = await apiClient.post("/api/questions", payload);
    return response.data;
  },
  async searchQuestionsSemantic(query, k = 5) {
    const response = await apiClient.get("/api/questions/search", {
      params: { query, k },
    });
    return response.data;
  },
  async getSimilarQuestions(questionHash, k = 5) {
    const response = await apiClient.get(
      `/api/questions/${questionHash}/similar`,
      { params: { k } },
    );
    return response.data;
  },
  async generateQuestionDraftCoach(payload) {
    const response = await apiClient.post(
      "/api/questions/draft-coach",
      payload,
    );
    return response.data;
  },
  async assessAnswerFit(questionHash, answerText) {
    const response = await apiClient.post(
      `/api/questions/${questionHash}/answer-fit`,
      { answerText },
    );
    return response.data;
  },
};
