import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { timeAgo } from '../../lib/utils.js';
import styles from './QuestionCard.module.css';

export default function QuestionCard({ question }) {
  if (!question) return null;

  const hash = question.questionHash;
  const authorName = question.author
    ? `${question.author.firstName || ''} ${question.author.lastName || ''}`.trim()
    : 'Unknown author';
  const answerLabel =
    question.answerCount === 1
      ? '1 answer'
      : `${question.answerCount || 0} answers`;

  return (
    <Link
      to={hash ? `/question/${hash}` : '#'}
      className={styles.card}
      aria-label={`Open question: ${question.title}`}
    >
      <div className={styles.card__body}>
        <h3 className={styles.card__title}>{question.title}</h3>
        {question.content ? (
          <p className={styles.card__excerpt}>{question.content}</p>
        ) : null}
      </div>

      <div className={styles.card__meta}>
        <span className={styles.card__author}>{authorName}</span>
        <span className={styles.card__dot} aria-hidden>
          ·
        </span>
        <span className={styles.card__time}>{timeAgo(question.createdAt)}</span>
        <span className={styles.card__answers}>
          <MessageSquare size={14} aria-hidden />
          {answerLabel}
        </span>
        {typeof question.score === 'number' ? (
          <span className={styles.card__score}>
            {(question.score * 100).toFixed(0)}% match
          </span>
        ) : null}
      </div>
    </Link>
  );
}
