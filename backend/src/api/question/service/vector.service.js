import { GoogleGenAI } from "@google/genai";
import { safeExecute } from "../../../../db/config.js";
// import { ServiceUnavailableError } from "../../../utils/errors/index.js";

const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const RECOMMEND_THRESHOLD = Number(process.env.RECOMMEND_THRESHOLD) || 0.75;
const RECOMMEND_K = Number(process.env.RECOMMEND_K) || 5;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Utility to collapse consecutive whitespace characters into a single space
 * and trim leading/trailing whitespace for consistent text formatting.
 * @param {string} value - The input text to normalize.
 * @returns {string} The normalized text with collapsed whitespace and trimmed ends.
 */
function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}
/**
 * Normalize the question title by converting to lowercase, applying Unicode NFKC normalization,
 * and collapsing multiple whitespace characters into single spaces. This ensures consistent
 * text formatting for downstream tasks such as duplicate detection and vector generation.
 * // Example: "  What's NEW in AI?  " -> "what's new in ai?";
 * @param {{title: string}} param - An object containing the question title.
 * @returns {string} The normalized question text.
 */
export function normalizeQuestionText({ title }) {
  return normalizeWhitespace(`${title || ''}`.normalize('NFKC').toLowerCase());
}
/**
 * Generate a normalized embedding for the provided question text using the Gemini API.
 *
 * @param {string} sourceText - The text to embed.
 * @param {Object} [options] - Optional parameters to customize the embedding generation.
 * @param {string} [options.taskType='RETRIEVAL_DOCUMENT'] - The specific Gemini task type.
 *   Use 'RETRIEVAL_QUERY' when generating embeddings for user searches.
 * @returns {Promise<{embedding: Array<number>}>} The normalized embedding vector.
 * @throws {Error} If the embedding response is invalid or missing values.
 */
export async function generateQuestionEmbedding(sourceText, options = {}) {
  const { taskType = 'RETRIEVAL_DOCUMENT'} = options;

  try {
    const response = await ai.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: sourceText,
        config: { 
            taskType: taskType,
            outputDimensionality: 768
        },
    })

    const values = response.embeddings[0].values;
    

    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('Gemini embedding response does not contain values');
    }

    return {
      embedding: values,
    };
  } catch (error) {
    console.error('Error:', error);
    console.error('====================');
    throw error;
  }
}
/**
 * Validate that an embedding is a valid array of numbers.
 * @param {*} embedding - The embedding to validate.
 * @throws {Error} If embedding is invalid.
 */
function validateEmbedding(embedding) {
  if (!Array.isArray(embedding)) {
    throw new Error('Embedding must be an array');
  }
  if (embedding.length === 0) {
    throw new Error('Embedding cannot be empty');
  }
  if (!embedding.every(v => typeof v === 'number' && !isNaN(v))) {
    throw new Error('Embedding must contain only valid numbers');
  }
}

/**
 * Store or update embedding vector in MySQL question_vectors table.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE for upsert behavior.
 *
 * @param {Object} payload - The payload containing question and embedding data.
 * @param {number|string} payload.questionId - The ID of the question.
 * @param {string} payload.sourceText - The normalized source text used for embedding.
 * @param {Array<number>} [payload.embedding=[]] - The full-dimensional embedding vector from Gemini.
 * @param {string} [payload.status='ready'] - The status of the vector (e.g., 'ready', 'failed').
 * @returns {Promise<void>}
 */
export async function storeQuestionVector({
  questionId,
  sourceText,
  embedding = [],
  status = 'ready',
}) {
  // Handle empty embeddings for failed status
  if (status === 'failed' || !embedding || embedding.length === 0) {
    const sql = `
      INSERT INTO question_vectors (question_id, source_text, embedding, status)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        source_text = VALUES(source_text),
        embedding = VALUES(embedding),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
    `;
    await safeExecute(sql, [
      questionId,
      sourceText,
      JSON.stringify([]),
      'failed',
    ]);
    return;
  }

 // Validate embedding before storage
  validateEmbedding(embedding);

  // Store embedding as JSON string using JSON.stringify()
  const embeddingJson = JSON.stringify(embedding);

  // Implement MySQL INSERT ... ON DUPLICATE KEY UPDATE for upsert
  const sql = `
    INSERT INTO question_vectors (question_id, source_text, embedding, status)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      source_text = VALUES(source_text),
      embedding = VALUES(embedding),
      status = VALUES(status),
      updated_at = CURRENT_TIMESTAMP
  `;

  try {
    await safeExecute(sql, [questionId, sourceText, embeddingJson, status]);
  } catch (error) {
    console.error('=== MYSQL UPSERT ERROR ===');
    console.error('Operation: storeQuestionVector');
    console.error(`Question ID: ${questionId}`);
    console.error(`Embedding length: ${embedding.length}`);
    console.error(`Status: ${status}`);
    console.error('SQL:', sql.trim().replace(/\s+/g, ' '));
    console.error('Error:', error);
    console.error('==========================');
    throw error;
  }
}
