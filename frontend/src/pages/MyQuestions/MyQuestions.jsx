import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { questionService } from "../../services/question/question.service";
import styles from "./MyQuestions.module.css";

export default function MyQuestions() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    questionService
      .getQuestions({ mine: true })
      .then((response) => mounted && setQuestions(response.data || []))
      .catch(
        (err) =>
          mounted &&
          setError(
            err.response?.data?.msg ||
              err.response?.data?.message ||
              "Unable to load your questions.",
          ),
      )
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading)
    return <p className={styles.state}>Loading your questions...</p>;
  if (error)
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Your activity</p>
          <h2>My Questions</h2>
          <p>Threads you have started in the community.</p>
        </div>
        <Link className={styles.askButton} to="/questions/ask">
          Ask a question <span aria-hidden="true">+</span>
        </Link>
      </header>
      {questions.length === 0 ? (
        <div className={styles.empty}>
          <h3>You haven't asked a question yet</h3>
          <p>Start a conversation and get help from the community.</p>
          <Link to="/questions/ask">Ask your first question</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {questions.map((question) => (
            <Link
              key={question.id}
              to={`/questions/${question.questionHash}`}
              className={styles.question}
            >
              <h3>{question.title}</h3>
              <p>{question.content}</p>
              <small>{question.answerCount ?? 0} answers</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
