import { apiClient } from '../core/api.client.js';

const mapQuestion = (question) => {
  if (!question) return null;

  const author =
    question.author ||
    (question.firstName || question.lastName || question.userId
      ? {
          id: question.userId ?? question.author?.id,
          firstName: question.firstName ?? question.author?.firstName ?? '',
          lastName: question.lastName ?? question.author?.lastName ?? '',
        }
      : null);

  return {
    id: question.id ?? question.question_id,
    questionHash: question.questionHash ?? question.question_hash,
    title: question.title ?? '',
    content: question.content ?? '',
    createdAt: question.createdAt ?? question.created_at,
    updatedAt: question.updatedAt ?? question.updated_at,
    answerCount: Number(question.answerCount ?? question.answer_count ?? 0),
    score: question.score,
    author,
  };
};

export const questionService = {
  async getQuestions(params = {}) {
    const query = {};
    if (params.search) query.search = params.search;
    if (params.mine) query.mine = 'true';

    const { data } = await apiClient.get('/api/questions', { params: query });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map(mapQuestion).filter(Boolean);
  },

  async searchQuestionsSemantic(query, options = {}) {
    const { data } = await apiClient.get('/api/questions/search', {
      params: {
        query,
        ...(options.k != null ? { k: options.k } : {}),
        ...(options.threshold != null ? { threshold: options.threshold } : {}),
      },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map(mapQuestion).filter(Boolean);
  },
};

export default questionService;
