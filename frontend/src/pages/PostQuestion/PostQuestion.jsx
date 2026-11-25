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


<button type="button" className={styles.secondaryButton} onClick={getCoachFeedback} disabled={isCoaching || isSubmitting}>
        {isCoaching ? "Checking draft..." : "Get AI feedback"}
        </button>

{coachFeedback?.tips && (
        <section className={styles.coach}>
        <div className={styles.coach__heading}>
            <span aria-hidden="true">✦</span>
            <div><h3>AI Draft Coach</h3><p>Suggestions to make your question clearer</p></div>
        </div>
        <ul>{coachFeedback.tips.map((tip, index) => <li key={`${tip}-${index}`}>{tip}</li>)}</ul>
        </section>
    )}