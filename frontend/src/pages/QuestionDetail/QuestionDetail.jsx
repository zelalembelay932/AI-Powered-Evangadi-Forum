import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../contexts/AuthContext";
import { questionService } from "../../services/question/question.service";
import { answerService } from "../../services/answer/answer.service";
import styles from "./QuestionDetail.module.css";

export default function QuestionDetail() {
  const { questionHash } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [fitResult, setFitResult] = useState(null);
  const [loadedQuestionHash, setLoadedQuestionHash] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const isLoading = loadedQuestionHash !== questionHash;

  useEffect(() => {
    let mounted = true;
    questionService
      .getSingleQuestion(questionHash)
      .then((response) => {
        if (!mounted) return;
        setQuestion(response.question);
        setAnswers(response.answers || []);
        setError("");
      })
      .catch((err) => {
        if (!mounted) return;
        setQuestion(null);
        setAnswers([]);
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Unable to load this question.",
        );
      })
      .finally(() => mounted && setLoadedQuestionHash(questionHash));
    return () => {
      mounted = false;
    };
  }, [questionHash]);

  const checkFit = async () => {
    setError("");
    if (answerText.trim().length < 20) {
      setError("Answer text must be at least 20 characters.");
      return;
    }
    setIsChecking(true);
    try {
      const response = await questionService.assessAnswerFit(
        questionHash,
        answerText,
      );
      setFitResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Unable to assess answer fit.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  const postAnswer = async (event) => {
    event.preventDefault();
    setError("");
    if (answerText.trim().length < 20) {
      setError("Answer text must be at least 20 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await answerService.postAnswer(question.id, answerText);
      setAnswers((current) => [response.data, ...current]);
      setAnswerText("");
      setFitResult(null);
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          "Unable to post the answer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p className={styles.state}>Loading question...</p>;
  if (error && !question)
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  if (!question) return <p className={styles.state}>Question not found.</p>;

  const isOwner = Number(user?.id) === Number(question.author?.id);

  return (
    <div className={styles.page}>
      <article className={styles.question}>
        <p className={styles.eyebrow}>Question</p>
        <h2>{question.title}</h2>
        <div className={styles.markdown}>
          <ReactMarkdown>{question.content}</ReactMarkdown>
        </div>
        <small className={styles.byline}>
          Asked by {question.author?.firstName} {question.author?.lastName}
        </small>
      </article>
      <section className={styles.answers}>
        <header className={styles.sectionHeader}>
          <h3>Answers</h3>
          <span>{answers.length}</span>
        </header>
        {answers.length === 0 && (
          <p className={styles.empty}>No answers yet. Be the first to help.</p>
        )}
        {answers.map((answer) => (
          <article key={answer.id} className={styles.answer}>
            <div className={styles.markdown}>
              <ReactMarkdown>{answer.content}</ReactMarkdown>
            </div>
            <small className={styles.byline}>
              {answer.author?.firstName} {answer.author?.lastName}
            </small>
          </article>
        ))}
      </section>
      {isOwner ? (
        <p className={styles.notice}>You cannot answer your own question.</p>
      ) : (
        <form onSubmit={postAnswer} className={styles.answerForm}>
          <h3>Your answer</h3>
          <p>Share a clear, relevant response. Markdown is supported.</p>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <label className={styles.srOnly} htmlFor="answer-content">
            Write your answer
          </label>
          <textarea
            id="answer-content"
            value={answerText}
            onChange={(event) => setAnswerText(event.target.value)}
            rows={8}
            minLength={20}
            required
            placeholder="Write an answer that addresses the question..."
          />
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={checkFit}
              disabled={isChecking || isSubmitting}
            >
              {isChecking ? "Checking..." : "Check answer fit"}
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting || isChecking}
            >
              {isSubmitting ? "Posting..." : "Post answer"}
            </button>
          </div>
          {fitResult && (
            <div
              className={`${styles.fitResult} ${styles[`fitResult--${fitResult.level}`] || ""}`}
            >
              <strong>Answer fit: {fitResult.level}</strong>
              <p>{fitResult.note}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
