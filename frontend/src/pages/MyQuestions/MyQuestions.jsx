import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import QuestionCard from '../../components/QuestionCard/QuestionCard.jsx';
import { questionService } from '../../services/question/question.service.js';
import ui from '../../styles/pageStates.module.css';
import styles from './MyQuestions.module.css';

export default function MyQuestions() {
  const [myQuestions, setMyQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadMine = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await questionService.getQuestions({ mine: true });
        if (!cancelled) {
          setMyQuestions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setMyQuestions([]);
          setError(
            err?.response?.data?.msg ||
              err?.message ||
              'Could not load your questions. Please try again.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadMine();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.myQuestions}>
      <header className={styles.myQuestions__header}>
        <div>
          <h1 className={styles.myQuestions__title}>My questions</h1>
          <p className={styles.myQuestions__subtitle}>
            Topics you have posted to the forum.
          </p>
        </div>
        <Link to='/questions/ask' className={styles.myQuestions__ask}>
          Ask a question
        </Link>
      </header>

      {isLoading ? (
        <div
          className={`${ui.pageStates__message} ${ui['pageStates__message--loading']}`}
          role='status'
        >
          Loading your questions…
        </div>
      ) : null}

      {!isLoading && error ? (
        <div
          className={`${ui.pageStates__message} ${ui['pageStates__message--error']}`}
          role='alert'
        >
          {error}
        </div>
      ) : null}

      {!isLoading && !error && myQuestions.length === 0 ? (
        <div
          className={`${ui.pageStates__message} ${ui['pageStates__message--empty']}`}
        >
          <p>You haven&apos;t asked any questions yet.</p>
          <p className={ui.pageStates__panelGap}>
            <Link to='/questions/ask'>Ask your first question</Link> to get help
            from the community.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && myQuestions.length > 0 ? (
        <ul className={styles.myQuestions__list}>
          {myQuestions.map((question) => (
            <li key={question.questionHash || question.id}>
              <QuestionCard question={question} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
