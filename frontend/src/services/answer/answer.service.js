import { apiClient } from "../core/api.client.js";

export const answerService = {
  async postAnswer(questionId, content) {
    const response = await apiClient.post("/api/answers", {
      questionId,
      content,
    });
    return response.data;
  },
};
