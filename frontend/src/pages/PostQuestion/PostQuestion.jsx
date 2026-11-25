import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questionService } from "../../services/question/question.service";
import styles from "./PostQuestion.module.css";

export default function PostQuestion() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [coachFeedback, setCoachFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCoaching, setIsCoaching] = useState(false);
    const [error, setError] = useState("");

    const updateField = event => {
        setFormData(current => ({ ...current, [event.target.name]: event.target.value }));
    };

    const getCoachFeedback = async () => {
        setError("");
        if (formData.title.trim().length < 5 || formData.content.trim().length < 10) {
            setError("Title must be at least 5 characters and content at least 10 characters.");
            return;
        }
        setIsCoaching(true);
        try {
            const response = await questionService.generateQuestionDraftCoach(formData);
            setCoachFeedback(response.data);
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || "Unable to generate draft feedback.");
        } finally {
            setIsCoaching(false);
        }
    };

    const submitQuestion = async event => {
        event.preventDefault();
        setError("");
        if (formData.title.trim().length < 5 || formData.content.trim().length < 10) {
            setError("Title must be at least 5 characters and content at least 10 characters.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await questionService.createQuestion(formData);
            navigate(`/questions/${response.data.questionHash}`);
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || "Unable to post the question.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={submitQuestion} className={styles.form}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>Share what you are learning</p>
                <h2>Ask a question</h2>
                <p>Include enough detail so the community can understand the problem and help.</p>
            </header>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <label className={styles.field}>
                <span>Title</span>
                <small>Be specific and summarize the problem in one sentence.</small>
                <input name="title" value={formData.title} onChange={updateField} minLength={5} maxLength={255} required placeholder="e.g. How can I share state between React components?" />
            </label>
            <label className={styles.field}>
                <span>Details</span>
                <small>Describe what you tried, what you expected, and any error messages.</small>
                <textarea name="content" value={formData.content} onChange={updateField} rows={11} minLength={10} required placeholder="Add the context, steps to reproduce, and code or errors that may help..." />
            </label>
            <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={getCoachFeedback} disabled={isCoaching || isSubmitting}>
                    {isCoaching ? "Checking draft..." : "Get AI feedback"}
                </button>
                <button type="submit" className={styles.primaryButton} disabled={isSubmitting || isCoaching}>
                    {isSubmitting ? "Posting..." : "Post question"}
                </button>
            </div>
            {coachFeedback?.tips && (
                <section className={styles.coach}>
                    <div className={styles.coach__heading}>
                        <span aria-hidden="true">✦</span>
                        <div><h3>AI Draft Coach</h3><p>Suggestions to make your question clearer</p></div>
                    </div>
                    <ul>{coachFeedback.tips.map((tip, index) => <li key={`${tip}-${index}`}>{tip}</li>)}</ul>
                </section>
            )}
        </form>
    );
}