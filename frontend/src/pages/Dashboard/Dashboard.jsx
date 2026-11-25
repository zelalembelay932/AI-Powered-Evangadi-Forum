import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QuestionCard from '../../components/QuestionCard/QuestionCard.jsx';
import { questionService } from '../../services/question/question.service.js';
import ui from '../../styles/pageStates.module.css';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('keyword');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLabel, setActiveLabel] = useState('Latest questions');

  const firstName = user?.firstName?.trim();
  const welcomeLine = firstName
    ? `Good to see you, ${firstName}.`
    : 'Welcome to the forum.';

  const loadQuestions = useCallback(async (mode, query) => {
    setIsLoading(true);
    setError('');

    try {
      const trimmed = String(query || '').trim();
      let data = [];

      if (trimmed && mode === 'semantic') {
        data = await questionService.searchQuestionsSemantic(trimmed);
        setActiveLabel('AI similarity results');
      } else if (trimmed && mode === 'keyword') {
        data = await questionService.getQuestions({ search: trimmed });
        setActiveLabel('Keyword results');
      } else {
        data = await questionService.getQuestions();
        setActiveLabel('Latest questions');
      }

      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuestions([]);
      setError(
        err?.response?.data?.msg ||
          err?.message ||
          'Could not load questions. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions('keyword', '');
  }, [loadQuestions]);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadQuestions(searchMode, searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchMode('keyword');
    loadQuestions('keyword', '');
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboard__header}>
        <div>
          <p className={styles.dashboard__welcome}>{welcomeLine}</p>
          <h1 className={styles.dashboard__title}>Community questions</h1>
          <p className={styles.dashboard__subtitle}>{activeLabel}</p>
        </div>
        <Link to="/questions/ask" className={styles.dashboard__ask}>
          Ask a question
        </Link>
      </header>

      <form className={styles.dashboard__search} onSubmit={handleSubmit}>
        <div className={styles.dashboard__searchModes} role="group" aria-label="Search mode">
          <button
            type="button"
            className={`${styles.dashboard__modeBtn} ${
              searchMode === 'keyword' ? styles['dashboard__modeBtn--active'] : ''
            }`}
            onClick={() => setSearchMode('keyword')}
          >
            <Search size={14} aria-hidden />
            Keyword
          </button>
          <button
            type="button"
            className={`${styles.dashboard__modeBtn} ${
              searchMode === 'semantic' ? styles['dashboard__modeBtn--active'] : ''
            }`}
            onClick={() => setSearchMode('semantic')}
          >
            <Sparkles size={14} aria-hidden />
            Semantic
          </button>
        </div>

        <div className={styles.dashboard__searchRow}>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={
              searchMode === 'semantic'
                ? 'Search by meaning…'
                : 'Search by keyword…'
            }
            className={styles.dashboard__searchInput}
            aria-label="Search questions"
          />
          <button type="submit" className={styles.dashboard__searchSubmit}>
            Search
          </button>
          {searchQuery ? (
            <button
              type="button"
              className={styles.dashboard__searchClear}
              onClick={handleClear}
            >
              Clear
            </button>
          ) : null}
        </div>
      </form>

      {isLoading ? (
        <div
          className={`${ui.pageStates__message} ${ui['pageStates__message--loading']}`}
          role="status"
        >
          Loading questions…
        </div>
      ) : null}

      {!isLoading && error ? (
        <div
          className={`${ui.pageStates__message} ${ui['pageStates__message--error']}`}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {!isLoading && !error && questions.length === 0 ? (
        <div
          className={`${ui.pageStates__message} ${ui['pageStates__message--empty']}`}
        >
          <p>No questions found.</p>
          <p className={ui.pageStates__panelGap}>
            Try a different search, or{' '}
            <Link to="/questions/ask">ask the first question</Link>.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && questions.length > 0 ? (
        <ul className={styles.dashboard__list}>
          {questions.map((question) => (
            <li key={question.questionHash || question.id}>
              <QuestionCard question={question} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
