/**
 * Dashboard: default home after login; question list, quick actions, URL-driven search.
 * Data: `questionService` (keyword `q`, semantic `semantic`, or full list).
 */

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { questionService } from "../../services/question/question.service";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("keyword");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.firstName?.trim();
  const welcomeLine = firstName
    ? `Good to see you, ${firstName}.`
    : "Welcome to the forum.";

  const loadQuestions = useCallback(
    async (search) => {
      try {
        const response =
          searchMode === "semantic" && search
            ? await questionService.searchQuestionsSemantic(search)
            : await questionService.getQuestions({ search });
        setQuestions(response.data || []);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.msg ||
            err.response?.data?.message ||
            "Unable to load questions.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [searchMode],
  );

  useEffect(() => {
    let mounted = true;
    questionService
      .getQuestions()
      .then((response) => mounted && setQuestions(response.data || []))
      .catch((err) => {
        if (mounted) {
          setError(
            err.response?.data?.msg ||
              err.response?.data?.message ||
              "Unable to load questions.",
          );
        }
      })
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    loadQuestions(searchQuery.trim());
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Community forum</p>
          <h2>{welcomeLine}</h2>
          <p className={styles.subtitle}>
            Browse, search, and answer community questions.
          </p>
        </div>
        <Link className={styles.askButton} to="/questions/ask">
          Ask a question <span aria-hidden="true">+</span>
        </Link>
      </header>
      <section className={styles.feed}>
        <form onSubmit={handleSearch} className={styles.search}>
          <label className={styles.srOnly} htmlFor="question-search">
            Search questions
          </label>
          <input
            id="question-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search questions..."
          />
          <label className={styles.mode}>
            <span>Search mode</span>
            <select
              value={searchMode}
              onChange={(event) => setSearchMode(event.target.value)}
            >
              <option value="keyword">Keyword</option>
              <option value="semantic">AI semantic</option>
            </select>
          </label>
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
        {isLoading && <p className={styles.state}>Loading questions...</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {!isLoading && !error && questions.length === 0 && (
          <div className={styles.empty}>
            <h3>No questions found</h3>
            <p>
              Try a different search or ask the community your first question.
            </p>
            <Link to="/questions/ask">Ask a question</Link>
          </div>
        )}
        {!isLoading && questions.length > 0 && (
          <div className={styles.questionList}>
            {questions.map((question) => (
              <Link
                key={question.id || question.questionHash}
                to={`/questions/${question.questionHash}`}
                className={styles.question}
              >
                <h3>{question.title}</h3>
                <p className={styles.question__content}>{question.content}</p>
                <div className={styles.question__meta}>
                  <span>
                    {question.author?.firstName} {question.author?.lastName}
                  </span>
                  <span>{question.answerCount ?? 0} answers</span>
                  {question.createdAt && (
                    <time dateTime={question.createdAt}>
                      {new Date(question.createdAt).toLocaleDateString()}
                    </time>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
